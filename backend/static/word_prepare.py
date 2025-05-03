import json
import csv
import time  # 为防止过快请求被封建议加延迟
from database_connector import get_connection
import requests
from bs4 import BeautifulSoup
import random

# 准备一组常见的浏览器 UA
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 13_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1",
]


def get_etymology(word):
    """爬取单词词源"""
    try:
        url = f"https://www.etymonline.com/word/{word}"
        headers = {
            "User-Agent": random.choice(USER_AGENTS),
        }
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(
                f"Error: Status code {response.status_code} when fetching etymology for {word}"
            )
            return None
        soup = BeautifulSoup(response.text, "html.parser")
        section = soup.find("section", {"class": "-mt-4 -mb-2 lg:-mb-2"})
        if section:
            return section.text.strip()
    except Exception as e:
        print(f"Exception in get_etymology for '{word}': {e}")
    return None


def get_trans(word):
    """爬取单词翻译"""
    try:
        url = f"https://dictionary.cambridge.org/dictionary/english-chinese-simplified/{word}"

        headers = {
            "User-Agent": random.choice(USER_AGENTS),
        }
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(
                f"Error: Status code {response.status_code} when fetching translation for {word}"
            )
            return None
        soup = BeautifulSoup(response.text, "html.parser")
        translations = []  # 先定义为空数组
        divs = soup.find_all("div", {"class": "pr dsense"})
        if divs:
            for div in divs:
                translation = {}
                abbr_span = div.find("span", {"class": "pos dsense_pos"})
                if abbr_span:
                    translation["abbreviation"] = abbr_span.text.strip()
                trans_div = div.find(
                    "span", {"class": "trans dtrans dtrans-se break-cj"}
                )
                if trans_div:
                    translation["translation"] = trans_div.text.strip()
                if translation:
                    translations.append(translation)

        phonetic = ""
        phonetic_div = soup.find("div", {"class": "pos-header dpos-h"})
        if phonetic_div:
            phonetic_span = phonetic_div.find("span", {"class": "ipa dipa lpr-2 lpl-1"})
            if phonetic_span:
                phonetic = phonetic_span.text.strip()

        examples = []
        examples_div = soup.find_all("div", {"class": "examp dexamp"})
        for example_div in examples_div[:5]:
            example = {}
            sentence = example_div.find("span", {"class": "eg deg"})
            if sentence:
                example["sentence"] = sentence.text.strip()
            translation = example_div.find(
                "span", {"class": "trans dtrans dtrans-se hdb break-cj"}
            )
            if translation:
                example["translation"] = translation.text.strip()
            if example:
                examples.append(example)

        return {
            "word": word,
            "phonetic": phonetic,
            "etymology": get_etymology(word),
            "translations": translations,
            "example_sentence": examples,
        }

    except Exception as e:
        print(f"Exception in get_trans for '{word}': {e}")
        return None


def generateWordJSONFromCSV():
    """从CSV中读取单词，抓取翻译并生成JSON"""
    word_data_list = []

    with open("../word/10000word.csv", "r", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for i, row in enumerate(reader, 1):
            word = row["words"].strip()
            print(f"[{i}] 正在抓取: {word}...")
            word_info = get_trans(word)
            if word_info:
                word_data_list.append(word_info)
            else:
                print(f"❌ 未找到: {word}")

    # 写入 JSON 文件
    with open("word_data.json", "w", encoding="utf-8") as f:
        json.dump(word_data_list, f, ensure_ascii=False, indent=4)
        print("✅ 所有单词信息已保存到 word_data.json")


print(generateWordJSONFromCSV())


def insert_word_records():
    for i in range(1, 48):
        print(f"正在插入第{i}个文件")
        # 3. 读取JSON文件
        with open(f"../word/word{i}.json", "r", encoding="utf-8") as f:
            data = json.load(f)  # 这是一个list，每个元素是一个单词的字典
        with get_connection() as conn:
            with conn.cursor(dictionary=True) as cursor:
                for entry in data:
                    word = entry["word"]
                    phonetic = entry.get("phonetic", "")
                    print(word, phonetic)
                    cursor.execute("SELECT word_id FROM words WHERE word = %s", (word,))
                    existing_word = cursor.fetchone()
                    if existing_word:
                        continue  # 如果单词已经存在，跳过
                    # 插入到 word 表
                    cursor.execute(
                        "INSERT INTO words (phonetic, word, etymology) VALUES (%s, %s, %s)",
                        (phonetic, word, get_etymology(word)),
                    )
                    word_id = cursor.lastrowid  # 获取刚插入的word的id

                    # 插入 translations
                    translations = entry.get("translations", [])
                    for trans in translations:
                        abbreviation = trans.get("abbreviation", "")
                        translation_text = trans.get("translation", "")
                        cursor.execute(
                            "INSERT INTO translation (abbreviation, translation, word_id) VALUES (%s, %s, %s)",
                            (abbreviation, translation_text, word_id),
                        )

                    # 插入 example_sentences
                    examples = entry.get("example_sentence", [])
                    for ex in examples:
                        sentence = ex.get("sentence", "")
                        translation = ex.get("translation", "")
                        cursor.execute(
                            "INSERT INTO example_sentence (sentence, translation, word_id) VALUES (%s, %s, %s)",
                            (sentence, translation, word_id),
                        )

                    conn.commit()  # 提交事务

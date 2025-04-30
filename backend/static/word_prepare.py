import json

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
    url = f"https://www.etymonline.com/word/{word}"
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
    }
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Error: Status code {response.status_code}")
        return None
    soup = BeautifulSoup(response.text, "html.parser")
    section = soup.find("section", {"class": "-mt-4 -mb-2 lg:-mb-2"})
    if section:
        return section.text.strip()
    return None


def get_trans(word):
    """爬取单词翻译"""
    url = (
        f"https://dictionary.cambridge.org/dictionary/english-chinese-simplified/{word}"
    )

    headers = {
        "User-Agent": random.choice(USER_AGENTS),
    }
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Error: Status code {response.status_code}")
        return None
    soup = BeautifulSoup(response.text, "html.parser")
    divs = soup.find_all("div", {"class": "pr dsense"})
    if divs:
        translations = []
        for div in divs:
            abbr_span = div.find("span", {"class": "pos dsense_pos"})
            if abbr_span:
                translations.append(abbr_span.text.strip())  # 提取子div中的文本
        return translations  # 返回一个包含所有翻译的列表
    return None


print(get_trans("fire"))


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

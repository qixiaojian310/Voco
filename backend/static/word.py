import json

from database_connector import get_connection


def insert_word_records():
    # 3. 读取JSON文件
    with open("../word/word1.json", "r", encoding="utf-8") as f:
        data = json.load(f)  # 这是一个list，每个元素是一个单词的字典
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            for entry in data:
                word = entry["word"]
                phonetic = entry.get("phonetic", "")
                print(word, phonetic)

                # 插入到 word 表
                cursor.execute(
                    "INSERT INTO words (phonetic, word) VALUES (%s, %s)",
                    (phonetic, word),
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

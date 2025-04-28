import json
from database_connector import get_connection


def get_words_brief(keyword=None):
    """根据关键词模糊查询单词（简要版），如果keyword为空，返回全部"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            if keyword:
                sql = "SELECT word_id, word, phonetic FROM words WHERE word LIKE %s"
                like_keyword = f"%{keyword}%"
                cursor.execute(sql, (like_keyword,))
            else:
                sql = "SELECT * FROM words"
                cursor.execute(sql)
            words = cursor.fetchall()
            return words


def get_words_with_trans(keyword=None):
    """根据关键词模糊查询单词及其翻译，如果keyword为空，返回全部"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            if keyword:
                sql = "SELECT word_id, word, phonetic FROM words WHERE word LIKE %s"
                like_keyword = f"%{keyword}%"
                cursor.execute(sql, (like_keyword,))
            else:
                sql = "SELECT word_id, word, phonetic FROM words"
                cursor.execute(sql)
            words = cursor.fetchall()
            for word in words:
                cursor.execute(
                    "SELECT * FROM translation WHERE word_id = %s", (word["word_id"],)
                )
                word["translations"] = cursor.fetchall()
            return words


def get_words_details(keyword):
    """根据关键词模糊查询单词及其翻译和例句，如果keyword为空，返回全部"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM words WHERE word = %s", (keyword,))
            word = cursor.fetchone()
            if word:
                cursor.execute(
                    "SELECT * FROM translation WHERE word_id = %s",
                    (word["word_id"],),
                )
                word["translations"] = cursor.fetchall()
                cursor.execute(
                    "SELECT * FROM example_sentence WHERE word_id = %s",
                    (word["word_id"],),
                )
                word["example_sentence"] = cursor.fetchall()
            return word


def create_wordbook_records(
    username: str, wordbook_name: str, description: str, is_public: bool
):
    """创建一个单词本"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            # 插入到 wordbook 表
            cursor.execute(
                "INSERT INTO wordbooks (name, description, is_public, created_at, updated_at) VALUES (%s, %s, %s, NOW(), NOW())",
                (wordbook_name, description, is_public),
            )
            wordbook_id = cursor.lastrowid  # 获取刚插入的wordbook的id
            cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
            user_id = cursor.fetchone()["user_id"]  # 获取用户的id
            # 插入到 user_wordbook 表
            cursor.execute(
                "INSERT INTO wordbook_user_record (wordbook_id, user_id) VALUES (%s, %s)",
                (wordbook_id, user_id),
            )
            conn.commit()  # 提交事务


# 添加单词到单词本
def add_word_to_wordbook(word: str, wordbook_id):
    """添加单个词汇到单词本"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            # 获取单词的id
            cursor.execute("SELECT word_id FROM words WHERE word = %s", (word,))
            word_id = cursor.fetchone()["word_id"]  # 获取单词的id
            if word_id is None:
                return False
            cursor.execute(
                "INSERT INTO wordbook_contents (word_id, wordbook_id, added_at) VALUES (%s, %s, NOW())",
                (word_id, wordbook_id),
            )
            conn.commit()  # 提交事务


def add_words_to_wordbook_from_json_data(wordbook_id, json_file_path):
    """
    从 JSON 数据批量添加单词到单词本。
    返回：
      - not_found_words: 在words表中找不到的单词
      - already_in_wordbook: 在wordbook_contents表中已经存在的单词
    """
    not_found_words = []
    already_in_wordbook = []
    final_add_words = []

    with open(json_file_path, "r", encoding="utf-8") as f:
        words = json.load(f)
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            for word in words:
                # 先查 words 表
                cursor.execute("SELECT word_id FROM words WHERE word = %s", (word,))
                result = cursor.fetchone()

                if not result:
                    # 不存在words表
                    not_found_words.append(word)
                    continue

                word_id = result["word_id"]

                # 再查 wordbook_contents 是否已经有这个word_id
                cursor.execute(
                    "SELECT 1 FROM wordbook_contents WHERE wordbook_id = %s AND word_id = %s",
                    (wordbook_id, word_id),
                )
                exist = cursor.fetchone()

                if exist:
                    # 已经存在wordbook_contents
                    already_in_wordbook.append(word)
                else:
                    # 可以插入
                    cursor.execute(
                        "INSERT INTO wordbook_contents (word_id, wordbook_id, added_at) VALUES (%s, %s, NOW())",
                        (word_id, wordbook_id),
                    )
                    final_add_words.append(word)

            conn.commit()

    return not_found_words, already_in_wordbook, final_add_words


def get_books_by_user(username):
    """获取用户的单词本"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
            user_id = cursor.fetchone()["user_id"]
            cursor.execute(
                "SELECT * FROM wordbooks WHERE wordbook_id IN (SELECT wordbook_id FROM wordbook_user_record WHERE user_id = %s)",
                (user_id,),
            )
            books = cursor.fetchall()
            return books


def delete_book_from_user(wordbook_id):
    """删除用户的单词本"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            try:
                cursor.execute(
                    "DELETE FROM wordbooks WHERE wordbook_id = %s",
                    (wordbook_id,),
                )
                conn.commit()
                if cursor.rowcount == 0:
                    # 没有删除任何东西，说明id不存在
                    return False
                return wordbook_id
            except Exception as e:
                print(e)
                return False


__all__ = [
    "get_words_brief",
    "get_words_with_trans",
    "get_words_details",
    "create_wordbook_records",
    "add_word_to_wordbook",
    "add_words_to_wordbook_from_json_data",
    "get_books_by_user",
    "delete_book_from_user",
]

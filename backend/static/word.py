import json
from .database_connector import get_connection


def get_words_brief(word=None):
    """根据关键词模糊查询单词（简要版），如果keyword为空，返回全部"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            if word:
                sql = "SELECT word_id, word, phonetic FROM words WHERE word LIKE %s"
                like_keyword = f"%{word}%"
                cursor.execute(sql, (like_keyword,))
            else:
                sql = "SELECT * FROM words"
                cursor.execute(sql)
            words = cursor.fetchall()
            return words


def get_words_with_trans(word=None):
    """根据关键词模糊查询单词及其翻译，如果keyword为空，返回全部"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            if word:
                sql = "SELECT word_id, word, phonetic FROM words WHERE word LIKE %s"
                like_keyword = f"%{word}%"
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


def get_words_details(word, username):
    """根据关键词查询单词及其翻译和例句，如果keyword为空，返回全部"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM words WHERE word = %s", (word,))
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
                # 获取记忆记录
                cursor.execute(
                    """
                    SELECT * FROM user_words
                    JOIN users ON users.user_id = user_words.user_id
                    WHERE users.username = %s AND user_words.word_id = %s
                    """,
                    (username, word["word_id"]),
                )
                user_word = cursor.fetchone()
                if user_word:
                    word["user_word"] = {
                        "memory_status": user_word["memory_status"],
                        "review_count": user_word["review_count"],
                        "current_review": user_word["current_review"],
                        "easiness": user_word["easiness"],
                        "review_interval": user_word["review_interval"],
                        "next_review": user_word["next_review"],
                    }
                    cursor.execute(
                        "SELECT * FROM study_records WHERE user_word_id = %s",
                        (user_word["user_word_id"],),
                    )
                    word["study_records"] = cursor.fetchall()
                else:
                    word["user_word"] = None
                    word["study_records"] = []
            return word


def get_study_status_statistics(username, record_time):
    """获取用户的学习状态统计"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT 
                COUNT(*) AS count,
                sr.memory_status
                FROM users u
                JOIN user_words uw ON u.user_id = uw.user_id
                JOIN study_records sr ON uw.user_word_id = sr.user_word_id
                JOIN words w ON uw.word_id = w.word_id
                WHERE u.username = %s AND DATE(sr.record_time) = %s
                GROUP BY sr.memory_status;
                """,
                (username, record_time),
            )
            result = cursor.fetchall()
            return result


def create_wordbook(
    username: str, wordbook_name: str, description: str, is_public: bool
):
    """创建一个单词本"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            # 检查用户是否存在
            cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            # 插入到 wordbook 表
            cursor.execute(
                "INSERT INTO wordbooks (name, description, is_public, created_at, updated_at, publisher) VALUES (%s, %s, %s, NOW(), NOW(), %s)",
                (wordbook_name, description, is_public, user["user_id"]),
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
            return wordbook_id


def get_words_from_wordbook(wordbook_id):
    """根据单词本id获取单词"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(
                "SELECT word_id FROM wordbook_contents WHERE wordbook_id = %s",
                (wordbook_id,),
            )
            word_ids = cursor.fetchall()
            words = []
            for word_id in word_ids:
                cursor.execute(
                    "SELECT word FROM words WHERE word_id = %s", (word_id["word_id"],)
                )
                word = cursor.fetchone()
                words.append(word["word"])
            return words


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
            word_id_err = 1
            try:
                for res in words:
                    # 先查 words 表
                    cursor.execute(
                        "SELECT word_id FROM words WHERE word = %s", (res["word"],)
                    )
                    result = cursor.fetchone()
                    if not result:
                        # 不存在words表
                        not_found_words.append(res["word"])
                        continue

                    word_id = result["word_id"]
                    # 再查 wordbook_contents 是否已经有这个word_id
                    cursor.execute(
                        "SELECT 1 FROM wordbook_contents WHERE wordbook_id = %s AND word_id = %s",
                        (wordbook_id, word_id),
                    )
                    word_id_err = word_id
                    exist = cursor.fetchone()
                    if exist:
                        # 已经存在wordbook_contents
                        already_in_wordbook.append(res["word"])
                    else:
                        # 可以插入
                        cursor.execute(
                            "INSERT INTO wordbook_contents (word_id, wordbook_id, added_at) VALUES (%s, %s, NOW())",
                            (word_id, wordbook_id),
                        )
                        final_add_words.append(res["word"])

                conn.commit()
            except Exception as e:
                print("word", word_id_err)
                return not_found_words, already_in_wordbook, final_add_words

    return not_found_words, already_in_wordbook, final_add_words


def get_all_books(wordbook_name=None):
    """获取用户的单词本"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            if wordbook_name:
                # 模糊匹配：包含输入词
                cursor.execute(
                    "SELECT * FROM wordbooks WHERE is_public = 1 AND name LIKE %s",
                    (f"%{wordbook_name}%",),
                )
            else:
                # 如果没传入名字，就查所有公开单词本
                cursor.execute("SELECT * FROM wordbooks WHERE is_public = 1")
            books = cursor.fetchall()
            return books


def get_books_by_user(username, wordbook_name=None):
    """获取用户的单词本"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
            user_id = cursor.fetchone()["user_id"]
            if wordbook_name:
                # 模糊匹配：包含输入词
                cursor.execute(
                    "SELECT * FROM wordbooks WHERE publisher = %s AND name LIKE %s",
                    (user_id, f"%{wordbook_name}%"),
                )
            else:
                # 如果没传入名字，就查所有公开单词本
                cursor.execute(
                    "SELECT * FROM wordbooks WHERE publisher = %s",
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
    "create_wordbook",
    "add_word_to_wordbook",
    "add_words_to_wordbook_from_json_data",
    "get_books_by_user",
    "delete_book_from_user",
]

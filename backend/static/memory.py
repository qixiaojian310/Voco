from .database_connector import get_connection, logger
from enum import Enum
import datetime


class MemoryStatus(Enum):
    REMEMBERED = "remembered"  # 已记忆
    VAGUE = "vague"  # 模糊
    FORGOT = "forgot"  # 忘记
    UNLEARNED = "unlearned"  # 未学习


def answer_word_status(
    username: str,
    word: str,
    is_review: bool,
    memory_status: MemoryStatus,
    current_review: datetime.datetime,
    easiness: int,
    review_interval: int,
    next_review: datetime.datetime,
):
    try:
        with get_connection() as conn:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT user_id FROM users WHERE username = %s",
                    (username,),
                )
                user_id = cursor.fetchone()["user_id"]
                cursor.execute(
                    "SELECT word_id FROM words WHERE word = %s",
                    (word,),
                )
                word_id = cursor.fetchone()["word_id"]
                cursor.execute(
                    "SELECT * FROM user_words WHERE user_id = %s AND word_id = %s",
                    (user_id, word_id),
                )
                user_word = cursor.fetchone()
                user_word_id = 0
                if user_word:
                    cursor.execute(
                        "UPDATE user_words SET memory_status = %s, review_count = %s, current_review = %s, easiness = %s, review_interval = %s, next_review = %s WHERE user_id = %s AND word_id = %s",
                        (
                            memory_status,
                            user_word["review_count"] + 1,
                            current_review,
                            easiness,
                            review_interval,
                            next_review,
                            user_id,
                            word_id,
                        ),
                    )
                    user_word_id = user_word["user_word_id"]
                else:
                    cursor.execute(
                        "INSERT INTO user_words (user_id, word_id, memory_status, review_count, current_review, easiness, review_interval, next_review) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                        (
                            user_id,
                            word_id,
                            memory_status,
                            1,
                            current_review,
                            easiness,
                            review_interval,
                            next_review,
                        ),
                    )
                    user_word_id = cursor.lastrowid
                cursor.execute(
                    "INSERT INTO study_records (user_word_id, memory_status, is_review, record_time) VALUES (%s, %s, %s, %s)",
                    (user_word_id, memory_status, is_review, current_review),
                )
                conn.commit()
                logger.debug(
                    f"用户 {username} 对单词 {word} 的状态 {memory_status} 插入成功"
                )
                return True
    except Exception as e:
        logger.debug(f"插入失败: {e}")
        return False


def get_all_unlearned_words(username: str, wordbook_id: int):
    unlearnd_words = []
    try:
        with get_connection() as conn:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT user_id FROM users WHERE username = %s", (username,)
                )
                user_id = cursor.fetchone()["user_id"]
                cursor.execute(
                    """
                    SELECT word from words where word_id in
                    (SELECT wc.word_id
                    FROM wordbook_contents wc
                    LEFT JOIN user_words uw
                    ON wc.word_id = uw.word_id AND uw.user_id = %s
                    WHERE wc.wordbook_id = %s
                    AND uw.word_id IS NULL);
                    """,
                    (user_id, wordbook_id),
                )
                unlearnd_words: list = cursor.fetchall()
                return [unlearnd_word["word"] for unlearnd_word in unlearnd_words]
    except Exception as e:
        logger.debug(f"查询失败: {e}")
        return unlearnd_words


def get_all_reviewed_words(username: str, wordbook_id: int):
    reviewed_words = []

    try:
        with get_connection() as conn:
            with conn.cursor(dictionary=True) as cursor:
                # 获取用户 ID
                cursor.execute(
                    "SELECT user_id FROM users WHERE username = %s", (username,)
                )
                user_row = cursor.fetchone()
                if not user_row:
                    return []
                user_id = user_row["user_id"]

                # 获取该用户在该单词本中复习过的所有 user_words 记录
                cursor.execute(
                    """
                    SELECT uw.user_word_id, uw.word_id, uw.current_review, uw.review_interval
                    FROM user_words uw
                    JOIN wordbook_contents wc ON uw.word_id = wc.word_id
                    WHERE uw.user_id = %s AND wc.wordbook_id = %s
                """,
                    (user_id, wordbook_id),
                )

                user_words = cursor.fetchall()
                if not user_words:
                    return []

                word_ids = [row["word_id"] for row in user_words]
                user_word_ids = [row["user_word_id"] for row in user_words]

                # 批量获取 word_id → word 字典
                format_ids = ",".join(["%s"] * len(word_ids))
                cursor.execute(
                    f"""
                    SELECT word_id, word
                    FROM words
                    WHERE word_id IN ({format_ids})
                """,
                    word_ids,
                )
                word_rows = cursor.fetchall()
                word_map = {row["word_id"]: row["word"] for row in word_rows}

                # 批量获取 study_records，构建 user_word_id → record 列表字典
                format_user_word_ids = ",".join(["%s"] * len(user_word_ids))
                cursor.execute(
                    f"""
                    SELECT user_word_id, memory_status, record_time
                    FROM study_records
                    WHERE user_word_id IN ({format_user_word_ids})
                """,
                    user_word_ids,
                )
                record_rows = cursor.fetchall()
                study_record_map = {}
                for row in record_rows:
                    study_record_map.setdefault(row["user_word_id"], []).append(
                        {
                            "status": row["memory_status"],
                            "record_time": row["record_time"],
                        }
                    )

                # 组装最终结果
                for uw in user_words:
                    word_status = {
                        "word": word_map.get(uw["word_id"], ""),
                        "word_metric": {
                            "current_review": uw["current_review"],
                            "review_interval": uw["review_interval"],
                        },
                        "history_status": study_record_map.get(uw["user_word_id"], []),
                    }
                    reviewed_words.append(word_status)

                return reviewed_words

    except Exception as e:
        logger.debug(f"查询失败: {e}")
        return reviewed_words


def check_word_status(username: str, word: str):
    word_status = {"memory_status": MemoryStatus.UNLEARNED.value, "history_status": []}
    try:
        with get_connection() as conn:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT user_id FROM users WHERE username = %s", (username,)
                )
                user_id = cursor.fetchone()["user_id"]
                cursor.execute("SELECT word_id FROM words WHERE word = %s", (word,))
                word_id = cursor.fetchone()["word_id"]
                cursor.execute(
                    "SELECT memory_status,user_word_id FROM user_words WHERE user_id = %s AND word_id = %s",
                    (user_id, word_id),
                )
                user_word = cursor.fetchone()
                if user_word:
                    word_status["memory_status"] = user_word["memory_status"]
                else:
                    word_status["memory_status"] = MemoryStatus.UNLEARNED.value
                cursor.execute(
                    "SELECT memory_status, record_time FROM study_records WHERE user_word_id = %s",
                    (user_word["user_word_id"],),
                )
                history_records = cursor.fetchall()
                for record in history_records:
                    word_status["history_status"].append(
                        {
                            "status": record["memory_status"],
                            "record_time": record["record_time"],
                        }
                    )
                return word_status
    except Exception as e:
        logger.debug(f"查询失败: {e}")
        return MemoryStatus.UNLEARNED.value


def get_word_detail_from_wordbook(wordbook_id, search_word, username):
    """高性能查询：根据单词本 ID + 模糊词，返回带翻译和用户记录的单词详情"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            # 获取用户 ID
            cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            if not user:
                return []
            user_id = user["user_id"]

            # 查询当前单词本中的词（带 word 字段）
            if not search_word:
                cursor.execute(
                    """
                    SELECT wc.word_id, w.word
                    FROM wordbook_contents wc
                    JOIN words w ON wc.word_id = w.word_id
                    WHERE wc.wordbook_id = %s
                """,
                    (wordbook_id,),
                )
            else:
                cursor.execute(
                    """
                    SELECT wc.word_id, w.word
                    FROM wordbook_contents wc
                    JOIN words w ON wc.word_id = w.word_id
                    WHERE wc.wordbook_id = %s AND w.word LIKE %s
                """,
                    (wordbook_id, f"%{search_word}%"),
                )

            word_rows = cursor.fetchall()
            if not word_rows:
                return []

            word_id_list = [row["word_id"] for row in word_rows]

            # 批量获取翻译
            format_ids = ",".join(["%s"] * len(word_id_list))
            cursor.execute(
                f"""
                SELECT word_id, translation, abbreviation, translation_id
                FROM translation
                WHERE word_id IN ({format_ids})
                """,
                word_id_list,
            )
            translation_rows = cursor.fetchall()
            translation_map = {}
            for row in translation_rows:
                translation_map.setdefault(row["word_id"], []).append(row)

            # 批量获取用户词表记录
            cursor.execute(
                f"""
                SELECT user_word_id, word_id, memory_status, review_count, easiness, review_interval
                FROM user_words
                WHERE user_id = %s AND word_id IN ({format_ids})
                """,
                [user_id] + word_id_list,
            )
            user_word_rows = cursor.fetchall()
            user_word_map = {}
            user_word_id_list = []
            for row in user_word_rows:
                user_word_map[row["word_id"]] = row
                user_word_id_list.append(row["user_word_id"])

            # 批量获取学习记录
            study_record_map = {}
            if user_word_id_list:
                format_user_word_ids = ",".join(["%s"] * len(user_word_id_list))
                cursor.execute(
                    f"""
                    SELECT user_word_id, memory_status, record_time
                    FROM study_records
                    WHERE user_word_id IN ({format_user_word_ids})
                    """,
                    user_word_id_list,
                )
                study_record_rows = cursor.fetchall()
                for row in study_record_rows:
                    study_record_map.setdefault(row["user_word_id"], []).append(
                        {
                            "memory_status": row["memory_status"],
                            "record_time": row["record_time"],
                        }
                    )

            # 拼装最终结果
            word_status_list = []
            for row in word_rows:
                word_id = row["word_id"]
                word = row["word"]
                word_status = {
                    "word": word,
                    "translations": translation_map.get(word_id, []),
                    "user_word": user_word_map.get(word_id, {}),
                    "study_records": [],
                }
                if word_status["user_word"]:
                    user_word_id = word_status["user_word"]["user_word_id"]
                    word_status["study_records"] = study_record_map.get(
                        user_word_id, []
                    )
                word_status_list.append(word_status)

            return word_status_list


# def get_word_detail_from_wordbook(wordbook_id, search_word, username):
#     """根据单词本id获取单词"""
#     with get_connection() as conn:
#         with conn.cursor(dictionary=True) as cursor:
#             if not search_word or search_word == "":
#                 cursor.execute(
#                     "SELECT word_id FROM wordbook_contents WHERE wordbook_id = %s",
#                     (wordbook_id,),
#                 )
#             else:
#                 cursor.execute(
#                     """
#                 SELECT wc.word_id
#                 FROM wordbook_contents wc
#                 JOIN words w ON wc.word_id = w.word_id
#                 WHERE wc.wordbook_id = %s
#                 AND w.word LIKE %s
#                 """,
#                     (wordbook_id, f"%{search_word}%"),
#                 )

#             word_ids = cursor.fetchall()
#             words = []
#             for word_id in word_ids:
#                 word_status = {
#                     "word": "",
#                     "translations": [],
#                     "user_word": {},
#                     "study_records": [],
#                 }
#                 cursor.execute(
#                     "SELECT word FROM words WHERE word_id = %s", (word_id["word_id"],)
#                 )
#                 word = cursor.fetchone()["word"]
#                 word_status["word"] = word
#                 cursor.execute(
#                     "SELECT translation, abbreviation, translation_id FROM translation WHERE word_id = %s",
#                     (word_id["word_id"],),
#                 )
#                 word_status["translations"] = cursor.fetchall()
#                 cursor.execute(
#                     "SELECT user_id FROM users WHERE username = %s", (username,)
#                 )
#                 user_id = cursor.fetchone()["user_id"]
#                 cursor.execute("SELECT word_id FROM words WHERE word = %s", (word,))
#                 word_id = cursor.fetchone()["word_id"]
#                 cursor.execute(
#                     "SELECT memory_status,review_count, easiness,review_interval,user_word_id FROM user_words WHERE user_id = %s AND word_id = %s",
#                     (user_id, word_id),
#                 )
#                 user_word = cursor.fetchone()
#                 if user_word:
#                     word_status["user_word"] = user_word
#                     cursor.execute(
#                         "SELECT memory_status, record_time FROM study_records WHERE user_word_id = %s",
#                         (user_word["user_word_id"],),
#                     )
#                     study_records = cursor.fetchall()
#                     for record in study_records:
#                         word_status["study_records"].append(
#                             {
#                                 "memory_status": record["memory_status"],
#                                 "record_time": record["record_time"],
#                             }
#                         )
#                 else:
#                     word_status["user_word"] = {}
#                     word_status["study_records"] = []
#                 words.append(word_status)
#             return words

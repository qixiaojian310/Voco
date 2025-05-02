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
                cursor.execute(
                    "SELECT user_id FROM users WHERE username = %s", (username,)
                )
                user_id = cursor.fetchone()["user_id"]
                cursor.execute(
                    """
                    SELECT uw.*
                    FROM user_words uw
                    JOIN wordbook_contents wc ON uw.word_id = wc.word_id
                    WHERE uw.user_id = %s AND wc.wordbook_id = %s;
                    """,
                    (user_id, wordbook_id),
                )
                reviewed_word_metrics = cursor.fetchall()
                for word_metric in reviewed_word_metrics:
                    cursor.execute(
                        "SELECT * FROM study_records WHERE user_word_id = %s",
                        (word_metric["user_word_id"],),
                    )
                    study_records = cursor.fetchall()
                    cursor.execute(
                        "SELECT word FROM words WHERE word_id = %s",
                        (word_metric["word_id"],),
                    )
                    word_status = {
                        "word": cursor.fetchone()["word"],
                        "word_metric": {
                            "current_review": word_metric["current_review"],
                            "review_interval": word_metric["review_interval"],
                        },
                        "history_status": [],
                    }
                    for record in study_records:
                        word_status["history_status"].append(
                            {
                                "status": record["memory_status"],
                                "record_time": record["record_time"],
                            }
                        )
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
    """根据单词本id获取单词"""
    with get_connection() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(
                """
                SELECT wc.word_id
                FROM wordbook_contents wc
                JOIN words w ON wc.word_id = w.word_id
                WHERE wc.wordbook_id = %s
                AND w.word LIKE %s
                """,
                (wordbook_id, f"%{search_word}%"),
            )
            word_ids = cursor.fetchall()
            words = []
            for word_id in word_ids:
                word_status = {
                    "word": "",
                    "translations": [],
                    "user_word": {},
                    "study_records": [],
                }
                cursor.execute(
                    "SELECT word FROM words WHERE word_id = %s", (word_id["word_id"],)
                )
                word = cursor.fetchone()["word"]
                word_status["word"] = word
                cursor.execute(
                    "SELECT translation, abbreviation, translation_id FROM translation WHERE word_id = %s",
                    (word_id["word_id"],),
                )
                word_status["translations"] = cursor.fetchall()
                cursor.execute(
                    "SELECT user_id FROM users WHERE username = %s", (username,)
                )
                user_id = cursor.fetchone()["user_id"]
                cursor.execute("SELECT word_id FROM words WHERE word = %s", (word,))
                word_id = cursor.fetchone()["word_id"]
                cursor.execute(
                    "SELECT memory_status,review_count, easiness,review_interval,user_word_id FROM user_words WHERE user_id = %s AND word_id = %s",
                    (user_id, word_id),
                )
                user_word = cursor.fetchone()
                if user_word:
                    word_status["user_word"] = user_word
                    cursor.execute(
                        "SELECT memory_status, record_time FROM study_records WHERE user_word_id = %s",
                        (user_word["user_word_id"],),
                    )
                    study_records = cursor.fetchall()
                    for record in study_records:
                        word_status["study_records"].append(
                            {
                                "memory_status": record["memory_status"],
                                "record_time": record["record_time"],
                            }
                        )
                else:
                    word_status["user_word"] = {}
                    word_status["study_records"] = []
                words.append(word_status)
            return words

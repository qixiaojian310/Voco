from database_connector import get_connection, logger
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
    next_review: datetime.datetime,
    familiarity_score: int,
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
                    "INSERT INTO study_records (user_id, word_id, memory_status, is_review, record_time) VALUES (%s, %s, %s, %s, NOW())",
                    (user_id, word_id, memory_status, is_review),
                )
                cursor.execute(
                    "SELECT * FROM user_words WHERE user_id = %s AND word_id = %s",
                    (user_id, word_id),
                )
                user_word = cursor.fetchone()
                if user_word:
                    cursor.execute(
                        "UPDATE user_words SET memory_status = %s, review_count = %s, next_review = %s, familiarity_score = %s WHERE user_id = %s AND word_id = %s",
                        (
                            memory_status,
                            user_word["review_count"] + 1,
                            next_review,
                            familiarity_score,
                            user_id,
                            word_id,
                        ),
                    )
                else:
                    cursor.execute(
                        "INSERT INTO user_words (user_id, word_id, memory_status, review_count, next_review, familiarity_score) VALUES (%s, %s, %s, %s, %s, %s)",
                        (
                            user_id,
                            word_id,
                            memory_status,
                            1,
                            next_review,
                            familiarity_score,
                        ),
                    )
                conn.commit()
                logger.debug(
                    f"用户 {username} 对单词 {word} 的状态 {memory_status} 插入成功"
                )
    except Exception as e:
        logger.debug(f"插入失败: {e}")


def check_word_status(username: str, word: str):
    word_status = {"current_status": MemoryStatus.UNLEARNED.value, "history_status": []}
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
                    "SELECT memory_status FROM user_words WHERE user_id = %s AND word_id = %s",
                    (user_id, word_id),
                )
                user_word = cursor.fetchone()
                if user_word:
                    word_status["current_status"] = user_word["memory_status"]
                else:
                    word_status["current_status"] = MemoryStatus.UNLEARNED.value
                cursor.execute(
                    "SELECT memory_status, record_time FROM study_records WHERE user_id = %s AND word_id = %s",
                    (user_id, word_id),
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

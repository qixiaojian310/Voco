import datetime
from database_connector import logger, init_connection_pool
import word
# import memory


# 示例

if __name__ == "__main__":
    init_connection_pool()
    wordbook_id = word.create_wordbook(
        "qixiaojian", "sushiyun ielts wordbook", "Just for review", True
    )
    word.add_words_to_wordbook_from_json_data(
        wordbook_id, "../word/wordbook_test/book4.json"
    )

    # delete_book_from_user(1)

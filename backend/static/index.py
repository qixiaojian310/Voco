import datetime
from database_connector import logger, init_connection_pool
import word
import memory
from word_prepare import insert_word_records, get_etymology


# 示例

if __name__ == "__main__":
    init_connection_pool()
    insert_word_records()
    # print(get_etymology("abandon"))

    # delete_book_from_user(1)

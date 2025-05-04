from database_connector import logger, init_connection_pool

init_connection_pool()
from word_prepare import insert_word_records_from_single

if __name__ == "__main__":
    insert_word_records_from_single()
    # delete_book_from_user(1)

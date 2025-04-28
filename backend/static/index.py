from database_connector import logger, init_connection_pool
from word import insert_word_records

if __name__ == "__main__":
    init_connection_pool()
    insert_word_records()

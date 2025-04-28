from database_connector import logger, init_connection_pool
import word
from word_prepare import insert_word_records


# 示例

if __name__ == "__main__":
    init_connection_pool()
    print(word.get_books_by_user("qixiaojian"))
    print(
        word.add_words_to_wordbook_from_json_data(
            "6", "../word/wordbook_test/book1.json"
        )
    )

    # delete_book_from_user(1)

from database_connector import logger, init_connection_pool
from user import user_login, get_user_daily_goal

if __name__ == "__main__":
    init_connection_pool()
    logger.debug(user_login("qixiaojian", "sushiyun"))
    logger.debug(get_user_daily_goal("qixiaojian"))

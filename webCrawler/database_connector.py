import mysql.connector
from mysql.connector import pooling
from contextlib import contextmanager
import loguru
import os
from dotenv import load_dotenv

load_dotenv()
# 初始化日志
logger = loguru.logger

# 数据库配置
dbconfig = {
    "user": "root",
    "password": os.environ.get("MYSQL_PASSWORD"),
    "host": os.environ.get("MYSQL_HOST"),
    "database": os.environ.get("MYSQL_DATABASE"),
    "port": 3306,
    "connect_timeout": 5,
    "raise_on_warnings": True,
}

# 初始化连接池
connection_pool = None


def init_connection_pool():
    global connection_pool
    connection_pool = pooling.MySQLConnectionPool(
        pool_name="voco_pool", pool_size=5, **dbconfig
    )
    logger.debug(f"连接池初始化完成，大小: {connection_pool.pool_size}")


def close_connection_pool():
    global connection_pool
    if connection_pool:
        connection_pool = None
        logger.debug("连接池已关闭。")


@contextmanager
def get_connection():
    conn = None
    try:
        conn = connection_pool.get_connection()
        yield conn
    except mysql.connector.Error as err:
        logger.debug(f"获取连接失败: {err}")
        raise
    finally:
        if conn:
            conn.close()

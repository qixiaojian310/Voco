import mysql.connector
from mysql.connector import pooling
from contextlib import contextmanager
import loguru

# 初始化日志
logger = loguru.logger

# 数据库配置
dbconfig = {
    "user": "root",
    "password": "123456",
    "host": "120.76.53.217",
    "database": "voco",
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

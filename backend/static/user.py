from .database_connector import get_connection, logger
import mysql.connector
import hashlib


def get_user_count():
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM users")
                count = cursor.fetchone()[0]
                logger.debug(f"用户总数: {count}")
                return count
    except Exception as e:
        logger.debug(f"查询失败: {e}")
        return None


def create_user(username, password_hash, is_test=False):
    if is_test:
        password_hash = hashlib.sha1(password_hash.encode("utf-8")).hexdigest()
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
                    (username, password_hash),
                )
                conn.commit()
                logger.debug(f"用户 {username} 插入成功")
                user_id = cursor.lastrowid
                # 获取插入的完整记录
                cursor.execute(
                    "SELECT username, daily_goal, daily_reminder, reminder_time FROM users WHERE id = %s",
                    (user_id,),
                )
                user_record = cursor.fetchone()
                return user_record
    except mysql.connector.Error as err:
        logger.debug(f"插入失败: {err}")
        return None


def user_login(username, password_hash, is_test=False):
    if is_test:
        password_hash = hashlib.sha1(password_hash.encode("utf-8")).hexdigest()
    try:
        with get_connection() as conn:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(
                    "SELECT username, daily_goal, daily_reminder, reminder_time, streak_days FROM users WHERE username = %s AND password_hash = %s",
                    (username, password_hash),
                )
                user = cursor.fetchone()
                if user:
                    logger.debug(f"用户 {username} 登录成功")
                    return user
                else:
                    logger.debug(f"用户 {username} 登录失败")
                    return None
    except mysql.connector.Error as err:
        logger.debug(f"查询失败: {err}")
        return None


def change_password(username, old_password_hash, new_password_hash, is_test=True):
    if is_test:
        old_password_hash = hashlib.sha1(old_password_hash.encode("utf-8")).hexdigest()
        new_password_hash = hashlib.sha1(new_password_hash.encode("utf-8")).hexdigest()
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM users WHERE username = %s AND password_hash = %s",
                    (username, old_password_hash),
                )
                user = cursor.fetchone()
                if user:
                    cursor.execute(
                        "UPDATE users SET password_hash = %s WHERE username = %s",
                        (new_password_hash, username),
                    )
                    conn.commit()
                    logger.debug(f"用户 {username} 密码修改成功")
                    return True
                else:
                    logger.debug(f"用户 {username} 密码修改失败")
                    return False
    except mysql.connector.Error as err:
        logger.debug(f"查询失败: {err}")
        return False


def set_user_streak_days(username, streak_days):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE users SET streak_days = %s WHERE username = %s",
                    (streak_days, username),
                )
                if cursor.rowcount == 0:
                    logger.debug(f"用户 {username} 连续打卡天数未设置")
                    return False
                conn.commit()
                logger.debug(f"用户 {username} 连续打卡天数设置成功")
                return True
    except mysql.connector.Error as err:
        logger.debug(f"查询失败: {err}")
        return False


def set_user_setting_db(username, daily_goal, reminder_time):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE users SET daily_goal = %s, reminder_time = %s WHERE username = %s",
                    (daily_goal, reminder_time, username),
                )
                if cursor.rowcount == 0:
                    logger.debug(f"用户 {username} 每日目标未设置")
                    return False
                conn.commit()
                logger.debug(f"用户 {username} 每日目标设置成功")
                return True
    except mysql.connector.Error as err:
        logger.debug(f"查询失败: {err}")
        return False


def get_user_daily_goal(username, is_test=True):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT daily_goal FROM users WHERE username = %s",
                    (username,),
                )
                daily_goal = cursor.fetchone()
                if daily_goal:
                    logger.debug(f"用户 {username} 每日目标获取成功")
                    return daily_goal[0]
                else:
                    logger.debug(f"用户 {username} 每日目标获取失败")
                    return None
    except mysql.connector.Error as err:
        logger.debug(f"查询失败: {err}")
        return None


def get_user_streak_days(username, is_test=True):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT streak_days FROM users WHERE username = %s",
                    (username,),
                )
                streak_days = cursor.fetchone()
                if streak_days:
                    logger.debug(f"用户 {username} 连续打卡天数获取成功")
                    return streak_days[0]
                else:
                    logger.debug(f"用户 {username} 连续打卡天数获取失败")
                    return None
    except mysql.connector.Error as err:
        logger.debug(f"查询失败: {err}")
        return None

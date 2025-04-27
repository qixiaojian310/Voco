import mysql.connector

# 建立连接
config = {
    "user": "root",  # 数据库用户名
    "password": "123456",  # 数据库密码
    "host": "localhost",  # 数据库地址（本地为 localhost）
    "database": "voco",  # 数据库名
    "raise_on_warnings": True,  # 显示警告
}

try:
    conn = mysql.connector.connect(**config)
    print("数据库连接成功！")

    # 创建游标对象
    cursor = conn.cursor()

    # 执行SQL查询
    cursor.execute("SELECT VERSION()")
    db_version = cursor.fetchone()
    print("MySQL 版本:", db_version[0])

except mysql.connector.Error as err:
    print(f"连接失败: {err}")

finally:
    # 关闭连接
    if "conn" in locals() and conn.is_connected():
        cursor.close()
        conn.close()
        print("数据库连接已关闭")

from fastapi import FastAPI
from static.database_connector import init_connection_pool, close_connection_pool
from routers import auth
import uvicorn
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 🟢 启动时：初始化数据库连接池
    init_connection_pool()
    print("✅ Database connection pool initialized.")

    yield  # ⬅️ 应用正常运行

    # 🔴 关闭时：释放数据库连接池
    close_connection_pool()
    print("✅ Database connection pool closed.")


app = FastAPI(lifespan=lifespan)

# 挂载 auth 路由
app.include_router(auth.router)


def main():
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()

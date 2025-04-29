from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
import datetime

security = HTTPBearer()


class JWTManager:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm

    def generate_token(self, username: str, expires_minutes: int = 30) -> str:
        """生成JWT令牌"""
        expire = datetime.datetime.utcnow() + datetime.timedelta(
            minutes=expires_minutes
        )
        payload = {
            "exp": expire,
            "iat": datetime.datetime.utcnow(),
            "sub": username,
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def verify_token(self, token: str) -> Optional[str]:
        """验证JWT令牌"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload["sub"]
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
            print(f"Token验证失败: {e}")
            return None


# 初始化 JWT
jwt_manager = JWTManager(secret_key="voco")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> int:
    token = credentials.credentials
    user_id = jwt_manager.verify_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_id

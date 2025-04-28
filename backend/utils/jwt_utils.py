from typing import Optional, Dict, Any
import jwt
import datetime


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


# 初始化
jwt_manager = JWTManager(secret_key="your-secret-key-here")

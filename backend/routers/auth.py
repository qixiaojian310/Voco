from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from static.user import user_login
from utils.jwt_utils import JWTManager

router = APIRouter()  # 这里注意不是 app，是 router！
security = HTTPBearer()

# 初始化 JWT
jwt_manager = JWTManager(secret_key="voco")


class LoginRequest(BaseModel):
    username: str
    password_hash: str


@router.post("/login")
def login(request: LoginRequest):
    user = user_login(username=request.username, password_hash=request.password_hash)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = jwt_manager.generate_token(user["username"])
    return {"access_token": token, "token_type": "bearer"}


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> int:
    token = credentials.credentials
    user_id = jwt_manager.verify_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_id


@router.get("/protected")
def protected(user_id: int = Depends(get_current_user)):
    return {"message": f"Hello, user {user_id}"}

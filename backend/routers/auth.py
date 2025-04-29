from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from static.user import user_login
from utils.jwt_utils import get_current_user, jwt_manager

router = APIRouter()  # 这里注意不是 app，是 router！


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


@router.get("/protected")
def protected(user_id: int = Depends(get_current_user)):
    return {"message": f"Hello, user {user_id}"}

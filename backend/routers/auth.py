from fastapi import HTTPException, Depends, APIRouter
from pydantic import BaseModel
from static.user import (
    set_user_setting_db,
    set_user_streak_days,
    user_login,
    create_user,
)
from utils.jwt_utils import get_current_user, jwt_manager

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password_hash: str


class SettingRequest(BaseModel):
    daily_goal: int
    reminder_time: float


class streakDaysRequest(BaseModel):
    streak_day: str


@router.post("/login")
def login(request: LoginRequest):
    user = user_login(username=request.username, password_hash=request.password_hash)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = jwt_manager.generate_token(user["username"])
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/register")
def register(request: LoginRequest):
    user = create_user(username=request.username, password_hash=request.password_hash)
    if not user["username"]:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = jwt_manager.generate_token(user["username"])
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/set_user_setting")
def set_user_setting(
    request: SettingRequest, username: int = Depends(get_current_user)
):
    return set_user_setting_db(username, request.daily_goal, request.reminder_time)


@router.post("/set_streak_day")
def set_streak_day(
    request: streakDaysRequest, username: int = Depends(get_current_user)
):
    return set_user_streak_days(username, request.streak_day)


@router.get("/protected")
def protected(user_id: int = Depends(get_current_user)):
    return {"message": f"Hello, user {user_id}"}

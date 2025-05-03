from datetime import datetime, timedelta, timezone
from typing import Any, List, Optional
from fastapi import HTTPException, Depends, APIRouter
from pydantic import BaseModel
from static.word import (
    get_books_by_user,
    get_all_books,
    get_study_status_statistics,
    get_words_details,
    create_wordbook,
    add_words_to_wordbook,
)
from static.memory import (
    answer_word_status,
    get_all_reviewed_words,
    get_all_unlearned_words,
    get_word_detail_from_wordbook,
)
from utils.jwt_utils import get_current_user, jwt_manager

router = APIRouter()  # 这里注意不是 app，是 router！


class WordRequest(BaseModel):
    word: str


class AllWordRequest(BaseModel):
    wordbook_id: int


class AllWordDetailRequest(BaseModel):
    wordbook_id: int
    search_word: Optional[str] = None


class WordbookRequest(BaseModel):
    wordbook_name: Optional[str] = None


class AddWordbookRequest(BaseModel):
    wordbook_name: str
    wordbook_description: str
    content: List[Any]


class WordStatusRequest(BaseModel):
    word: str
    memory_status: str
    is_review: bool
    easiness: float
    review_interval: int
    next_review: datetime
    current_review: datetime


@router.post("/wordbook_list")
async def get_wordbook_list(
    request: WordbookRequest, username: int = Depends(get_current_user)
):
    wordbook_list = get_all_books(request.wordbook_name)
    return wordbook_list


@router.post("/wordbook_list_by_user")
async def get_wordbook_list_by_user(
    request: WordbookRequest,
    username: int = Depends(get_current_user),
):
    wordbook_list = get_books_by_user(username, request.wordbook_name)
    return wordbook_list


@router.post("/get_words_from_wordbook")
async def get_word(
    request: AllWordRequest,
    username: int = Depends(get_current_user),
):
    unlearned_word_list = get_all_unlearned_words(username, request.wordbook_id)
    review_word_list = get_all_reviewed_words(username, request.wordbook_id)
    return {
        "unlearned_word_list": unlearned_word_list,
        "review_word_list": review_word_list,
    }


@router.post("/get_words_detail_from_wordbook")
async def get_word_detail(
    request: AllWordDetailRequest,
    username: int = Depends(get_current_user),
):
    word_list = get_word_detail_from_wordbook(
        request.wordbook_id, request.search_word, username
    )
    return word_list


@router.post("/get_word_info")
async def get_word_info(
    request: WordRequest,
    username: int = Depends(get_current_user),
):
    word_detail = get_words_details(request.word, username)
    return word_detail


@router.post("/set_word_status")
async def set_word_memory_status(
    request: WordStatusRequest,
    username: int = Depends(get_current_user),
):
    return answer_word_status(
        username,
        request.word,
        request.is_review,
        request.memory_status,
        request.current_review,
        request.easiness,
        request.review_interval,
        request.next_review,
    )


@router.post("/add_wordbook")
async def add_wordbook(
    request: AddWordbookRequest,
    username: int = Depends(get_current_user),
):
    wordbook_id = create_wordbook(
        username, request.wordbook_name, request.wordbook_description, True
    )
    res = add_words_to_wordbook(wordbook_id, request.content)
    return res


@router.post("/get_memory_status")
async def get_memory_status(username: str = Depends(get_current_user)):
    result = []

    for i in range(30):
        # 向前推 i 天
        utc_day = datetime.utcnow().date() - timedelta(days=i)

        # 转为北京时间日期字符串
        local_day = datetime(
            utc_day.year, utc_day.month, utc_day.day, tzinfo=timezone.utc
        ).astimezone(timezone(timedelta(hours=8)))
        day_str = local_day.strftime("%Y-%m-%d")

        daily_stats = get_study_status_statistics(username, day_str)

        for stat in daily_stats:
            result.append(
                {
                    "date": day_str,
                    "memory_status": stat["memory_status"],
                    "count": stat["count"],
                }
            )

    return result

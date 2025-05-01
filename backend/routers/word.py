from datetime import datetime
from typing import Optional
from fastapi import HTTPException, Depends, APIRouter
from pydantic import BaseModel
from static.word import get_books_by_user, get_all_books, get_words_details
from static.memory import (
    answer_word_status,
    get_all_reviewed_words,
    get_all_unlearned_words,
)
from utils.jwt_utils import get_current_user, jwt_manager

router = APIRouter()  # 这里注意不是 app，是 router！


class WordRequest(BaseModel):
    word: str


class AllWordRequest(BaseModel):
    wordbook_id: int


class WordbookRequest(BaseModel):
    wordbook_name: Optional[str] = None


class WordStatusRequest(BaseModel):
    word: str
    memory_status: str
    is_review: bool
    easiness: int
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


@router.post("/get_word_info")
async def get_word_info(
    request: WordRequest,
    username: int = Depends(get_current_user),
):
    word_detail = get_words_details(request.word, username)
    return word_detail


@router.post("/set_word_memory_status")
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

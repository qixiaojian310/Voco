from fastapi import HTTPException, Depends, APIRouter
from pydantic import BaseModel
from static.word import get_books_by_user, get_all_books
from static.memory import get_all_reviewed_words, get_all_unlearnd_words
from utils.jwt_utils import get_current_user, jwt_manager

router = APIRouter()  # 这里注意不是 app，是 router！


class WordRequest(BaseModel):
    wordbook_id: int


@router.get("/wordbook_list")
async def get_wordbook_list():
    wordbook_list = get_all_books()
    return wordbook_list


@router.get("/wordbook_list_by_user")
async def get_wordbook_list_by_user(
    username: int = Depends(get_current_user),
):
    wordbook_list = get_books_by_user(username)
    return wordbook_list


@router.post("/wordbook")
async def get_word(
    request: WordRequest,
    username: int = Depends(get_current_user),
):
    unlearned_word_list = get_all_unlearnd_words(username, request.wordbook_id)
    review_word_list = get_all_reviewed_words(username, request.wordbook_id)
    return {
        "unlearned_word_list": unlearned_word_list,
        "review_word_list": review_word_list,
    }

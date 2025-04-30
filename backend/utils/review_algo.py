from math import ceil
from datetime import datetime, timedelta
from typing import Optional, Union, Dict


class SM2Review:
    def __init__(
        self,
        quality: int,
        easiness: float = 2.5,
        interval: int = 0,
        repetitions: int = 0,
        review_datetime: Optional[Union[datetime, str]] = None,
    ):
        self.quality = quality
        self.easiness = easiness
        self.interval = interval
        self.repetitions = repetitions

        if isinstance(review_datetime, str):
            self.review_datetime = datetime.fromisoformat(review_datetime)
        elif review_datetime:
            self.review_datetime = review_datetime
        else:
            self.review_datetime = datetime.utcnow()

        self.review_datetime = self.review_datetime.replace(microsecond=0)

    def compute(self) -> Dict:
        if self.quality < 3:
            # 复习失败：明天重新复习，重置记忆曲线
            self.interval = 1
            self.repetitions = 0
        else:
            if self.repetitions == 0:
                self.interval = 1
            elif self.repetitions == 1:
                self.interval = 6
            else:
                self.interval = ceil(self.interval * self.easiness)

            self.repetitions += 1

        # 更新 easiness factor（记忆难度系数）
        self.easiness += 0.1 - (5 - self.quality) * (0.08 + (5 - self.quality) * 0.02)
        self.easiness = max(self.easiness, 1.3)  # 最低不能低于 1.3

        next_review_date = self.review_datetime + timedelta(days=self.interval)

        return {
            "easiness": round(self.easiness, 2),
            "interval": self.interval,
            "repetitions": self.repetitions,
            "review_datetime": next_review_date.isoformat(sep=" ", timespec="seconds"),
        }


def first_review(
    quality: int, review_datetime: Optional[Union[datetime, str]] = None
) -> Dict:
    return SM2Review(
        quality=quality,
        easiness=2.5,
        interval=0,
        repetitions=0,
        review_datetime=review_datetime,
    ).compute()

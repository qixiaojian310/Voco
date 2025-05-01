export interface ReviewParams {
  qualityText: 'remembered' | 'forgot' | 'vague'; // 用户打分 0~5
  easiness: number;
  interval: number;
  review_count: number;
  review_datetime?: string | Date;
}

export interface ReviewResult {
  easiness: number;
  interval: number;
  review_count: number;
  review_datetime: string; // 格式化后的下次复习时间
}

export function computeSM2(params: ReviewParams): ReviewResult {
  let { qualityText, easiness, interval, review_count, review_datetime } = params;
  const quality = {
    'remembered': 5,
    'forgot': 0,
    'vague': 3,
  }[qualityText];
  const now = review_datetime ? new Date(review_datetime) : new Date();
  now.setMilliseconds(0);

  if (quality < 3) {
    interval = 1;
    review_count = 0;
  } else {
    if (review_count === 0) {interval = 1;}
    else if (review_count === 1) {interval = 6;}
    else {interval = Math.ceil(interval * easiness);}

    review_count += 1;
  }

  easiness += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  easiness = Math.max(easiness, 1.3);

  const nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    easiness: parseFloat(easiness.toFixed(2)),
    interval,
    review_count,
    review_datetime: nextReviewDate.toISOString().replace('T', ' ').slice(0, 19),
  };
}

export function firstReview(
  qualityText: 'vague' | 'remembered' | 'forgot',
  review_datetime?: string | Date
): ReviewResult {
  return computeSM2({
    qualityText,
    easiness: 2.5,
    interval: 0,
    review_count: 0,
    review_datetime,
  });
}

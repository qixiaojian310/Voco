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
export interface MemoryCurveOptions {
  totalDays: number; // 模拟的总天数
  initialEasiness?: number; // 初始 easiness，默认 2.5
  qualityPerReview?: number; // 每次复习的质量，默认 5（全部记住）
  maxReviews?: number; // 最多复习多少次，默认不限制
}
export type MemoryPoint = {
  day: number;
  retention: number;
};

export function computeSM2(params: ReviewParams): ReviewResult {
  let {qualityText, easiness, interval, review_count, review_datetime} = params;
  const quality = {
    remembered: 5,
    forgot: 0,
    vague: 3,
  }[qualityText];
  if (quality < 3) {
    interval = 1;
    review_count = 0;
  } else {
    if (review_count === 0) {
      interval = 1;
    } else if (review_count === 1) {
      interval = 6;
    } else {
      interval = Math.ceil(interval * easiness);
    }

    review_count += 1;
  }

  easiness += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  easiness = Math.max(easiness, 1.3);
  const now = review_datetime ? new Date(review_datetime) : new Date();
  now.setMilliseconds(0);
  const nextReviewDate = new Date(
    now.getTime() + interval * 24 * 60 * 60 * 1000,
  );
  if (nextReviewDate < new Date()) {
    // 如果下次复习时间小于当前时间，则从当前时间计算下次时间
    return computeSM2({
      qualityText,
      easiness,
      interval,
      review_count,
      review_datetime: new Date(),
    });
  }
  return {
    easiness: parseFloat(easiness.toFixed(2)),
    interval,
    review_count,
    review_datetime: nextReviewDate
      .toISOString()
      .replace('T', ' ')
      .slice(0, 19),
  };
}

export function firstReview(
  qualityText: 'vague' | 'remembered' | 'forgot',
  review_datetime?: string | Date,
): ReviewResult {
  return computeSM2({
    qualityText,
    easiness: 2.5,
    interval: 0,
    review_count: 0,
    review_datetime,
  });
}

export function getCurvePoints(): MemoryPoint[] {
  const easiness = 2.5;
  const data = Array.from({length: 60}, (_, i) => {
    const t = i + 1;
    const retention = parseFloat((Math.exp(-t / easiness)).toFixed(3)) * 100;
    return {day: t, retention};
  });
  return [{day: 0, retention: 100}, ...data];
}

export function generateSM2MemoryCurve(
  options: MemoryCurveOptions,
): MemoryPoint[] {
  const {
    totalDays,
    initialEasiness = 2.5,
    qualityPerReview = 5,
    maxReviews = Infinity,
  } = options;

  let easiness = initialEasiness;
  let interval = 0;
  let reviewCount = 0;
  let lastReviewDay = 0;

  const result: MemoryPoint[] = [];

  for (let day = 0; day <= totalDays; day++) {
    const delta = day - lastReviewDay;
    const retention = Math.exp(-delta / easiness);
    result.push({day, retention: parseFloat(retention.toFixed(3)) * 100});

    if (delta === interval && reviewCount < maxReviews) {
      reviewCount++;
      lastReviewDay = day;

      // 更新间隔规则（基于 SM2）
      if (reviewCount === 1) {
        interval = 1;
      } else if (reviewCount === 2) {
        interval = 6;
      } else {
        interval = Math.ceil(interval * easiness);
      }

      // 更新 easiness
      const quality = qualityPerReview;
      easiness += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
      easiness = Math.max(1.3, parseFloat(easiness.toFixed(2)));
    }
  }

  return result;
}

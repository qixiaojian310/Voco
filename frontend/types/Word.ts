import { ReviewResult } from '../utils/sm2';

export type RemStatus =
  | 'remembered'
  | 'forgot'
  | 'vague'

export interface Translation {
  abbreviation: string;
  translation: string;
  /**For list */
  translation_id?: number;
}

export interface Sentence {
  sentence: string;
  translation: string;
}

export interface RemRecords{
  record_time: string;
  memory_status: RemStatus;
}

export interface RemDate {
  remembered: ReviewResult;
  forgot: ReviewResult;
  vague: ReviewResult;
}

export interface UserWord {
  memory_status: RemStatus;
  review_count: number;
  easiness: number;
  next_review: string;
  current_review: string;
  review_interval: number;
}
export interface Word {
  word: string;
  phonetic: string;
  translations: Translation[];
  example_sentence: Sentence[];
  etymology: string;
  study_records: RemRecords[];
  user_word: UserWord | null;
}

export interface WordItem {
  word: string;
  translations: Translation[];
  study_records: RemRecords[];
  user_word: UserWord | null;
}

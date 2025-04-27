export type Property =
  | 'n.'      // noun
  | 'v.'      // verb
  | 'adj.'    // adjective
  | 'adv.'    // adverb
  | 'pron.'   // pronoun
  | 'prep.'   // preposition
  | 'conj.'   // conjunction
  | 'int.'    // interjection
  | 'art.'    // article
  | 'det.'    // determiner
  | 'modal.'  // modal verb
  | 'aux.'    // auxiliary verb
  | 'phr.v.'; // phrasal verb

export type RemStatus =
  | 'remember'
  | 'forgot'
  | 'vague'

export interface Translation {
  property: Property;
  meaning: string;
}

export interface Sentence {
  sentence: string;
  translation: string;
}

export interface RemRecords{
  time: number;
  status: RemStatus;
}

export interface RemDate {
  remember: number;
  forgot: number;
  vague: number;
}
export interface Word {
  rawWord: string;
  phonetic: string;
  translations: Translation[];
  sentences: Sentence[];
  helpers: string[];
  rem_records: RemRecords[];
  rem_date: RemDate;
}

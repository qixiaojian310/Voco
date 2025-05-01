import { makeAutoObservable } from 'mobx';

class WordbookStore {
  wordbook_id: number = 0;
  unlearned_word_list: string[] = [];
  review_word_list: any[] = [];

  constructor() {
    makeAutoObservable(this);
  }
  // 设置当前单词本id
  setWordbookId(id: number) {
    this.wordbook_id = id;
  }
  // 设置未学习单词列表
  setUnlearnedWordList(list: string[]) {
    this.unlearned_word_list = list;
  }
  // 设置复习单词列表
  setReviewWordList(list: any[]) {
    this.review_word_list = list;
  }
}

const wordbookStore = new WordbookStore();
export default wordbookStore;

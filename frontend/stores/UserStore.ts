import { makeAutoObservable } from 'mobx';

class UserStore {
  isLoggedIn: boolean = false;
  selectBookId: number = -1;

  constructor() {
    makeAutoObservable(this);
  }

  // 登录方法
  login() {
    this.isLoggedIn = true;
  }

  // 登出方法
  logout() {
    this.isLoggedIn = false;
  }

  selectBook(bookId:number) {
    this.selectBookId = bookId;
  }
  unSelectBook() {
    this.selectBookId = -1;
  }
  // 获取登录状态
  getLoginStatus() {
    return this.isLoggedIn;
  }
}

const userStore = new UserStore();
export default userStore;

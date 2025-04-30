import {requestWrapper} from './requestWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

interface BasicUserInfo {
  username: string;
  password: string;
}

interface ConvertedUserInfo {
  username: string;
  password_hash: string;
}

export const signin = async (
  userInfo: BasicUserInfo
) => {
  // convert password to hash
  const convertedUserInfo: ConvertedUserInfo = {
    username: userInfo.username,
    password_hash: CryptoJS.SHA1(userInfo.password).toString(CryptoJS.enc.Hex),
  };
  const res = await requestWrapper(
    '/login',
    convertedUserInfo,
    {
      method: 'POST',
    }
  );
  if (typeof res !== 'number') {
    const body = await res.json();
    AsyncStorage.setItem('access_token', body.access_token);
    return body.content;
  } else {
    return res;
  }
};

export const signup = async (
  userInfo: BasicUserInfo
) => {
  const convertedUserInfo: ConvertedUserInfo = {
    username: userInfo.username,
    password_hash: CryptoJS.SHA1(userInfo.password).toString(CryptoJS.enc.Hex),
  };
  const res = await requestWrapper(
    '/register',
    convertedUserInfo,
    {
      method: 'POST',
    },
  );
  if (typeof res !== 'number') {
    const body = await res.json();
    AsyncStorage.setItem('access_token', body.access_token);
    return body;
  } else {
    return res;
  }
};

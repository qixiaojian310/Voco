import {requestWrapper} from './requestWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

interface BasicUserInfo {
  username: string;
  password: string;
}

interface UserSetting {
  daily_goal: number,
  reminder_time: string,
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
    await AsyncStorage.setItem('access_token', body.access_token);
    await AsyncStorage.setItem('userInfo', JSON.stringify(body.user));

    return body;
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
    await AsyncStorage.setItem('access_token', body.access_token);
    await AsyncStorage.setItem('userInfo', JSON.stringify(body.user));
    return body;
  } else {
    return res;
  }
};


export const set_streak_day = async (
  streak_day: string
) => {
  const res = await requestWrapper(
    '/set_streak_day',
    {
      streak_day,
    },
    {
      method: 'POST',
    },
  );
  if (typeof res !== 'number') {
    const body = await res.json();

    return body;
  } else {
    return res;
  }
};


export const set_user_setting = async (
  userSetting: UserSetting
) => {
  const res = await requestWrapper(
    '/set_user_setting',
    {
      daily_goal: userSetting.daily_goal,
      reminder_time: userSetting.reminder_time,
    },
    {
      method: 'POST',
    },
  );
  if (typeof res !== 'number') {
    const body = await res.json();
    return body;
  } else {
    return res;
  }
};


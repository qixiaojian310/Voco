import AsyncStorage from '@react-native-async-storage/async-storage';
import userStore from '../stores/UserStore';

let expireCounter = 0;
const MAX_RETRY_TIME = 1;
type methodType = 'GET' | 'POST' | 'PUT' | 'DELETE'
const BASE_URL = 'http://192.168.1.104:8000';
/**
 * This function is used to send a request to the backend, including the user's uid and token, uid is used to identify the user, and token is used to verify the user's identity, uid is stored in the body and accessToken is stored in the header
 * @param requestURL The URL of the request backend, request already have base url so you just need to pass the path like '/api/xxx'
 * @param body The body of the request
 * @returns The response of the backend
 */
export const requestWrapper = async (
  requestURL: string,
  body: object,
  options?: {
    method?: methodType
    signal?: AbortSignal
  },
): Promise<number | Response> => {
  const { method, signal } = options ?? {};
  const bodyString = JSON.stringify(body);
  const requestOptions: any = {
    method: method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (AsyncStorage.getItem('access_token') || ''),
    },
  };
  try {
    const response = await fetch(
      BASE_URL + requestURL,
      {
        ...requestOptions,
        body: bodyString,
        signal,
      },
    );
    console.log('fetch response', response);
    if (response.ok) {
      return response;
    } else {
      if (expireCounter < MAX_RETRY_TIME) {
        // refresh token
        expireCounter++;
        return requestWrapper(requestURL, body, options);
      } else {
        expireCounter = 0;
        if (response.status === 401) {
          // token expired
          await AsyncStorage.removeItem('access_token');
          userStore.logout();
          return 401;
        }
        return response.status;
      }
    }
  } catch (error: any) {
    console.log('fetch error', error);
    return -1;
  }
};

import { requestWrapper } from './requestWrapper';

export const get_word_info = async (word: string) => {
  const res = await requestWrapper(
    '/get_word_info',
    {
      word,
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

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

export const set_word_status = async (request: any) => {
  const res = await requestWrapper(
    '/set_word_status',
    request,
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

export const get_word_status = async () => {
  const res = await requestWrapper(
    '/get_memory_status',
    {},
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

export const get_words_detail_from_wordbook = async (wordbook_id:number,search_word:string) => {
  const res = await requestWrapper(
    '/get_words_detail_from_wordbook',
    {
      wordbook_id,
      search_word,
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

import {requestWrapper} from './requestWrapper';

export const get_all_wordbook = async (wordbook_name?: string) => {
  const res = await requestWrapper(
    '/wordbook_list',
    wordbook_name && wordbook_name !== ''
      ? {
          wordbook_name,
        }
      : {},
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

export const get_all_wordbook_by_user = async (wordbook_name?: string) => {
  const res = await requestWrapper(
    '/wordbook_list_by_user',
    wordbook_name && wordbook_name !== ''
      ? {
          wordbook_name,
        }
      : {},
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

export const get_words_from_wordbook = async (wordbook_id?: number) => {
  const res = await requestWrapper(
    '/get_words_from_wordbook',
    {
      wordbook_id,
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

export const add_words_to_wordbook = async (addBundle?: any) => {
  const res = await requestWrapper(
    '/add_wordbook',
    addBundle,
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

export const delete_wordbook = async (wordbook_id?: any) => {
  const res = await requestWrapper(
    '/delete_wordbook',
    {
      wordbook_id,
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


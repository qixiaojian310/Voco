import { requestWrapper } from './requestWrapper';

export const get_all_wordbook = async () => {
  const res = await requestWrapper(
    '/wordbook_list',
    undefined,
    {
      method: 'GET',
    },
  );
  if (typeof res !== 'number') {
    const body = await res.json();
    return body;
  } else {
    return res;
  }
};

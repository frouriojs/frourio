import type { AspidaClient, BasicHeaders } from 'aspida';
import { dataToURLString } from 'aspida';
import type { Methods as Methods_by08hd } from '.';
import type { Methods as Methods_1v3s1wc } from './empty/noEmpty';
import type { Methods as Methods_lh8uw9 } from './multiForm';
import type { Methods as Methods_1vs3486 } from './texts';
import type { Methods as Methods_1dzdpsx } from './texts/sample';
import type { Methods as Methods_1xhiioa } from './users';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '');
  const PATH0 = '/empty/noEmpty';
  const PATH1 = '/multiForm';
  const PATH2 = '/texts';
  const PATH3 = '/texts/sample';
  const PATH4 = '/users';
  const GET = 'GET';
  const POST = 'POST';
  const PUT = 'PUT';

  return {
    empty: {
      noEmpty: {
        get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_1v3s1wc['get']['resBody']>(prefix, PATH0, GET, option).text(),
        $get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_1v3s1wc['get']['resBody']>(prefix, PATH0, GET, option).text().then(r => r.body),
        $path: () => `${prefix}${PATH0}`,
      },
    },
    multiForm: {
      post: (option: { body: Methods_lh8uw9['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_lh8uw9['post']['resBody']>(prefix, PATH1, POST, option, 'FormData').json(),
      $post: (option: { body: Methods_lh8uw9['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_lh8uw9['post']['resBody']>(prefix, PATH1, POST, option, 'FormData').json().then(r => r.body),
      $path: () => `${prefix}${PATH1}`,
    },
    texts: {
      sample: {
        put: (option: { body: Methods_1dzdpsx['put']['reqBody'], config?: T | undefined }) =>
          fetch<Methods_1dzdpsx['put']['resBody']>(prefix, PATH3, PUT, option).json(),
        $put: (option: { body: Methods_1dzdpsx['put']['reqBody'], config?: T | undefined }) =>
          fetch<Methods_1dzdpsx['put']['resBody']>(prefix, PATH3, PUT, option).json().then(r => r.body),
        $path: () => `${prefix}${PATH3}`,
      },
      get: (option: { query: Methods_1vs3486['get']['query'], config?: T | undefined }) =>
        fetch<Methods_1vs3486['get']['resBody']>(prefix, PATH2, GET, option).text(),
      $get: (option: { query: Methods_1vs3486['get']['query'], config?: T | undefined }) =>
        fetch<Methods_1vs3486['get']['resBody']>(prefix, PATH2, GET, option).text().then(r => r.body),
      put: (option?: { config?: T | undefined } | undefined) =>
        fetch(prefix, PATH2, PUT, option).send(),
      $put: (option?: { config?: T | undefined } | undefined) =>
        fetch(prefix, PATH2, PUT, option).send().then(r => r.body),
      $path: (option?: { method?: 'get' | undefined; query: Methods_1vs3486['get']['query'] } | undefined) =>
        `${prefix}${PATH2}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
    },
    users: {
      get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_1xhiioa['get']['resBody']>(prefix, PATH4, GET, option).json(),
      $get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_1xhiioa['get']['resBody']>(prefix, PATH4, GET, option).json().then(r => r.body),
      post: (option: { body: Methods_1xhiioa['post']['reqBody'], config?: T | undefined }) =>
        fetch(prefix, PATH4, POST, option).send(),
      $post: (option: { body: Methods_1xhiioa['post']['reqBody'], config?: T | undefined }) =>
        fetch(prefix, PATH4, POST, option).send().then(r => r.body),
      $path: () => `${prefix}${PATH4}`,
    },
    get: (option?: { query?: Methods_by08hd['get']['query'] | undefined, config?: T | undefined } | undefined) =>
      fetch<Methods_by08hd['get']['resBody'], BasicHeaders, Methods_by08hd['get']['status']>(prefix, '', GET, option).json(),
    $get: (option?: { query?: Methods_by08hd['get']['query'] | undefined, config?: T | undefined } | undefined) =>
      fetch<Methods_by08hd['get']['resBody'], BasicHeaders, Methods_by08hd['get']['status']>(prefix, '', GET, option).json().then(r => r.body),
    post: (option: { body: Methods_by08hd['post']['reqBody'], query: Methods_by08hd['post']['query'], config?: T | undefined }) =>
      fetch<Methods_by08hd['post']['resBody'], BasicHeaders, Methods_by08hd['post']['status']>(prefix, '', POST, option, 'FormData').json(),
    $post: (option: { body: Methods_by08hd['post']['reqBody'], query: Methods_by08hd['post']['query'], config?: T | undefined }) =>
      fetch<Methods_by08hd['post']['resBody'], BasicHeaders, Methods_by08hd['post']['status']>(prefix, '', POST, option, 'FormData').json().then(r => r.body),
    $path: (option?: { method?: 'get' | undefined; query: Methods_by08hd['get']['query'] } | { method: 'post'; query: Methods_by08hd['post']['query'] } | undefined) =>
      `${prefix}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;

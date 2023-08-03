import type { AspidaClient, BasicHeaders } from 'aspida';
import { dataToURLString } from 'aspida';
import type { Methods as Methods0 } from '.';
import type { Methods as Methods1 } from './empty/noEmpty';
import type { Methods as Methods2 } from './multiForm';
import type { Methods as Methods3 } from './texts';
import type { Methods as Methods4 } from './texts/sample';
import type { Methods as Methods5 } from './users';

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
          fetch<Methods1['get']['resBody']>(prefix, PATH0, GET, option).text(),
        $get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods1['get']['resBody']>(prefix, PATH0, GET, option).text().then(r => r.body),
        $path: () => `${prefix}${PATH0}`,
      },
    },
    multiForm: {
      post: (option: { body: Methods2['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods2['post']['resBody']>(prefix, PATH1, POST, option, 'FormData').json(),
      $post: (option: { body: Methods2['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods2['post']['resBody']>(prefix, PATH1, POST, option, 'FormData').json().then(r => r.body),
      $path: () => `${prefix}${PATH1}`,
    },
    texts: {
      sample: {
        put: (option: { body: Methods4['put']['reqBody'], config?: T | undefined }) =>
          fetch<Methods4['put']['resBody']>(prefix, PATH3, PUT, option).json(),
        $put: (option: { body: Methods4['put']['reqBody'], config?: T | undefined }) =>
          fetch<Methods4['put']['resBody']>(prefix, PATH3, PUT, option).json().then(r => r.body),
        $path: () => `${prefix}${PATH3}`,
      },
      get: (option: { query: Methods3['get']['query'], config?: T | undefined }) =>
        fetch<Methods3['get']['resBody']>(prefix, PATH2, GET, option).text(),
      $get: (option: { query: Methods3['get']['query'], config?: T | undefined }) =>
        fetch<Methods3['get']['resBody']>(prefix, PATH2, GET, option).text().then(r => r.body),
      put: (option?: { config?: T | undefined } | undefined) =>
        fetch(prefix, PATH2, PUT, option).send(),
      $put: (option?: { config?: T | undefined } | undefined) =>
        fetch(prefix, PATH2, PUT, option).send().then(r => r.body),
      $path: (option?: { method?: 'get' | undefined; query: Methods3['get']['query'] } | undefined) =>
        `${prefix}${PATH2}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
    },
    users: {
      get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods5['get']['resBody']>(prefix, PATH4, GET, option).json(),
      $get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods5['get']['resBody']>(prefix, PATH4, GET, option).json().then(r => r.body),
      post: (option: { body: Methods5['post']['reqBody'], config?: T | undefined }) =>
        fetch(prefix, PATH4, POST, option).send(),
      $post: (option: { body: Methods5['post']['reqBody'], config?: T | undefined }) =>
        fetch(prefix, PATH4, POST, option).send().then(r => r.body),
      $path: () => `${prefix}${PATH4}`,
    },
    get: (option?: { query?: Methods0['get']['query'] | undefined, config?: T | undefined } | undefined) =>
      fetch<Methods0['get']['resBody'], BasicHeaders, Methods0['get']['status']>(prefix, '', GET, option).json(),
    $get: (option?: { query?: Methods0['get']['query'] | undefined, config?: T | undefined } | undefined) =>
      fetch<Methods0['get']['resBody'], BasicHeaders, Methods0['get']['status']>(prefix, '', GET, option).json().then(r => r.body),
    post: (option: { body: Methods0['post']['reqBody'], query: Methods0['post']['query'], config?: T | undefined }) =>
      fetch<Methods0['post']['resBody'], BasicHeaders, Methods0['post']['status']>(prefix, '', POST, option, 'FormData').json(),
    $post: (option: { body: Methods0['post']['reqBody'], query: Methods0['post']['query'], config?: T | undefined }) =>
      fetch<Methods0['post']['resBody'], BasicHeaders, Methods0['post']['status']>(prefix, '', POST, option, 'FormData').json().then(r => r.body),
    $path: (option?: { method?: 'get' | undefined; query: Methods0['get']['query'] } | { method: 'post'; query: Methods0['post']['query'] } | undefined) =>
      `${prefix}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;

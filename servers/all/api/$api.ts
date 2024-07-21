import type { AspidaClient, BasicHeaders } from 'aspida';
import { dataToURLString } from 'aspida';
import type { Methods as Methods_by08hd } from '.';
import type { Methods as Methods_y4s9gl } from './500';
import type { Methods as Methods_1v3s1wc } from './empty/noEmpty';
import type { Methods as Methods_lh8uw9 } from './multiForm';
import type { Methods as Methods_1vs3486 } from './texts';
import type { Methods as Methods_1ditf5b } from './texts/_label@string';
import type { Methods as Methods_1dzdpsx } from './texts/sample';
import type { Methods as Methods_1xhiioa } from './users';
import type { Methods as Methods_1talbbr } from './users/_userId@number';
import type { Methods as Methods_uxiaye } from './users/_userId@number/_name';
import type { Methods as Methods_fqsz2z } from './zod';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '');
  const PATH0 = '/500';
  const PATH1 = '/empty/noEmpty';
  const PATH2 = '/multiForm';
  const PATH3 = '/texts';
  const PATH4 = '/texts/sample';
  const PATH5 = '/users';
  const PATH6 = '/zod';
  const GET = 'GET';
  const POST = 'POST';
  const PUT = 'PUT';

  return {
    $500: {
      get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_y4s9gl['get']['resBody']>(prefix, PATH0, GET, option).text(),
      $get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_y4s9gl['get']['resBody']>(prefix, PATH0, GET, option).text().then(r => r.body),
      $path: () => `${prefix}${PATH0}`,
    },
    empty: {
      noEmpty: {
        get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_1v3s1wc['get']['resBody']>(prefix, PATH1, GET, option).text(),
        $get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_1v3s1wc['get']['resBody']>(prefix, PATH1, GET, option).text().then(r => r.body),
        $path: () => `${prefix}${PATH1}`,
      },
    },
    multiForm: {
      post: (option: { body: Methods_lh8uw9['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_lh8uw9['post']['resBody']>(prefix, PATH2, POST, option, 'FormData').json(),
      $post: (option: { body: Methods_lh8uw9['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_lh8uw9['post']['resBody']>(prefix, PATH2, POST, option, 'FormData').json().then(r => r.body),
      $path: () => `${prefix}${PATH2}`,
    },
    texts: {
      _label: (val1: string) => {
        const prefix1 = `${PATH3}/${val1}`;

        return {
          get: (option: { query: Methods_1ditf5b['get']['query'], config?: T | undefined }) =>
            fetch<Methods_1ditf5b['get']['resBody']>(prefix, prefix1, GET, option).text(),
          $get: (option: { query: Methods_1ditf5b['get']['query'], config?: T | undefined }) =>
            fetch<Methods_1ditf5b['get']['resBody']>(prefix, prefix1, GET, option).text().then(r => r.body),
          $path: (option?: { method?: 'get' | undefined; query: Methods_1ditf5b['get']['query'] } | undefined) =>
            `${prefix}${prefix1}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
        };
      },
      sample: {
        put: (option: { body: Methods_1dzdpsx['put']['reqBody'], config?: T | undefined }) =>
          fetch<Methods_1dzdpsx['put']['resBody']>(prefix, PATH4, PUT, option).json(),
        $put: (option: { body: Methods_1dzdpsx['put']['reqBody'], config?: T | undefined }) =>
          fetch<Methods_1dzdpsx['put']['resBody']>(prefix, PATH4, PUT, option).json().then(r => r.body),
        $path: () => `${prefix}${PATH4}`,
      },
      get: (option?: { query?: Methods_1vs3486['get']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods_1vs3486['get']['resBody']>(prefix, PATH3, GET, option).text(),
      $get: (option?: { query?: Methods_1vs3486['get']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods_1vs3486['get']['resBody']>(prefix, PATH3, GET, option).text().then(r => r.body),
      put: (option?: { config?: T | undefined } | undefined) =>
        fetch(prefix, PATH3, PUT, option).send(),
      $put: (option?: { config?: T | undefined } | undefined) =>
        fetch(prefix, PATH3, PUT, option).send().then(r => r.body),
      $path: (option?: { method?: 'get' | undefined; query: Methods_1vs3486['get']['query'] } | undefined) =>
        `${prefix}${PATH3}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
    },
    users: {
      _userId: (val1: number) => {
        const prefix1 = `${PATH5}/${val1}`;

        return {
          _name: (val2: number | string) => {
            const prefix2 = `${prefix1}/${val2}`;

            return {
              get: (option?: { config?: T | undefined } | undefined) =>
                fetch<Methods_uxiaye['get']['resBody']>(prefix, prefix2, GET, option).text(),
              $get: (option?: { config?: T | undefined } | undefined) =>
                fetch<Methods_uxiaye['get']['resBody']>(prefix, prefix2, GET, option).text().then(r => r.body),
              $path: () => `${prefix}${prefix2}`,
            };
          },
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_1talbbr['get']['resBody']>(prefix, prefix1, GET, option).json(),
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_1talbbr['get']['resBody']>(prefix, prefix1, GET, option).json().then(r => r.body),
          $path: () => `${prefix}${prefix1}`,
        };
      },
      get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_1xhiioa['get']['resBody']>(prefix, PATH5, GET, option).json(),
      $get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_1xhiioa['get']['resBody']>(prefix, PATH5, GET, option).json().then(r => r.body),
      post: (option: { body: Methods_1xhiioa['post']['reqBody'], config?: T | undefined }) =>
        fetch(prefix, PATH5, POST, option).send(),
      $post: (option: { body: Methods_1xhiioa['post']['reqBody'], config?: T | undefined }) =>
        fetch(prefix, PATH5, POST, option).send().then(r => r.body),
      $path: () => `${prefix}${PATH5}`,
    },
    zod: {
      get: (option: { query: Methods_fqsz2z['get']['query'], config?: T | undefined }) =>
        fetch<Methods_fqsz2z['get']['resBody']>(prefix, PATH6, GET, option).json(),
      $get: (option: { query: Methods_fqsz2z['get']['query'], config?: T | undefined }) =>
        fetch<Methods_fqsz2z['get']['resBody']>(prefix, PATH6, GET, option).json().then(r => r.body),
      post: (option?: { query?: Methods_fqsz2z['post']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods_fqsz2z['post']['resBody']>(prefix, PATH6, POST, option).json(),
      $post: (option?: { query?: Methods_fqsz2z['post']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods_fqsz2z['post']['resBody']>(prefix, PATH6, POST, option).json().then(r => r.body),
      put: (option: { body: Methods_fqsz2z['put']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_fqsz2z['put']['resBody']>(prefix, PATH6, PUT, option, 'FormData').json(),
      $put: (option: { body: Methods_fqsz2z['put']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_fqsz2z['put']['resBody']>(prefix, PATH6, PUT, option, 'FormData').json().then(r => r.body),
      $path: (option?: { method?: 'get' | undefined; query: Methods_fqsz2z['get']['query'] } | { method: 'post'; query: Methods_fqsz2z['post']['query'] } | undefined) =>
        `${prefix}${PATH6}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
    },
    get: (option?: { query?: Methods_by08hd['get']['query'] | undefined, config?: T | undefined } | undefined) =>
      fetch<Methods_by08hd['get']['resBody'], BasicHeaders, Methods_by08hd['get']['status']>(prefix, '', GET, option).json(),
    $get: (option?: { query?: Methods_by08hd['get']['query'] | undefined, config?: T | undefined } | undefined) =>
      fetch<Methods_by08hd['get']['resBody'], BasicHeaders, Methods_by08hd['get']['status']>(prefix, '', GET, option).json().then(r => r.body),
    post: (option: { body: Methods_by08hd['post']['reqBody'], query: Methods_by08hd['post']['query'], config?: T | undefined }) =>
      fetch<Methods_by08hd['post']['resBody'], BasicHeaders, Methods_by08hd['post']['status']>(prefix, '', POST, option, 'FormData').json(),
    $post: (option: { body: Methods_by08hd['post']['reqBody'], query: Methods_by08hd['post']['query'], config?: T | undefined }) =>
      fetch<Methods_by08hd['post']['resBody'], BasicHeaders, Methods_by08hd['post']['status']>(prefix, '', POST, option, 'FormData').json().then(r => r.body),
    put: (option: { body: Methods_by08hd['put']['reqBody'], query: Methods_by08hd['put']['query'], config?: T | undefined }) =>
      fetch<Methods_by08hd['put']['resBody'], BasicHeaders, Methods_by08hd['put']['status']>(prefix, '', PUT, option).json(),
    $put: (option: { body: Methods_by08hd['put']['reqBody'], query: Methods_by08hd['put']['query'], config?: T | undefined }) =>
      fetch<Methods_by08hd['put']['resBody'], BasicHeaders, Methods_by08hd['put']['status']>(prefix, '', PUT, option).json().then(r => r.body),
    $path: (option?: { method?: 'get' | undefined; query: Methods_by08hd['get']['query'] } | { method: 'post'; query: Methods_by08hd['post']['query'] } | { method: 'put'; query: Methods_by08hd['put']['query'] } | undefined) =>
      `${prefix}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;

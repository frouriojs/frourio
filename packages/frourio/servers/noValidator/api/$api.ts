/* eslint-disable */
import { AspidaClient, BasicHeaders, dataToURLString } from 'aspida'
import { Methods as Methods0 } from '.'
import { Methods as Methods1 } from './empty/noEmpty'
import { Methods as Methods2 } from './multiForm'
import { Methods as Methods3 } from './texts'
import { Methods as Methods4 } from './texts/sample'
import { Methods as Methods5 } from './users'
import { Methods as Methods6 } from './users/_userId@number'

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/empty/noEmpty'
  const PATH1 = '/multiForm'
  const PATH2 = '/texts'
  const PATH3 = '/texts/sample'
  const PATH4 = '/users'
  const GET = 'GET'
  const POST = 'POST'
  const PUT = 'PUT'

  return {
    empty: {
      noEmpty: {
        get: (option?: { config?: T }) =>
          fetch<Methods1['get']['resBody']>(prefix, PATH0, GET, option).text(),
        $get: (option?: { config?: T }) =>
          fetch<Methods1['get']['resBody']>(prefix, PATH0, GET, option).text().then(r => r.body),
        $path: () => `${prefix}${PATH0}`
      }
    },
    multiForm: {
      post: (option: { body: Methods2['post']['reqBody'], config?: T }) =>
        fetch<Methods2['post']['resBody']>(prefix, PATH1, POST, option, 'FormData').json(),
      $post: (option: { body: Methods2['post']['reqBody'], config?: T }) =>
        fetch<Methods2['post']['resBody']>(prefix, PATH1, POST, option, 'FormData').json().then(r => r.body),
      $path: () => `${prefix}${PATH1}`
    },
    texts: {
      sample: {
        put: (option: { body: Methods4['put']['reqBody'], config?: T }) =>
          fetch<Methods4['put']['resBody']>(prefix, PATH3, PUT, option).json(),
        $put: (option: { body: Methods4['put']['reqBody'], config?: T }) =>
          fetch<Methods4['put']['resBody']>(prefix, PATH3, PUT, option).json().then(r => r.body),
        $path: () => `${prefix}${PATH3}`
      },
      get: (option: { query: Methods3['get']['query'], config?: T }) =>
        fetch<Methods3['get']['resBody']>(prefix, PATH2, GET, option).text(),
      $get: (option: { query: Methods3['get']['query'], config?: T }) =>
        fetch<Methods3['get']['resBody']>(prefix, PATH2, GET, option).text().then(r => r.body),
      put: (option?: { config?: T }) =>
        fetch<void>(prefix, PATH2, PUT, option).send(),
      $put: (option?: { config?: T }) =>
        fetch<void>(prefix, PATH2, PUT, option).send().then(r => r.body),
      $path: (option?: { method?: 'get'; query: Methods3['get']['query'] }) =>
        `${prefix}${PATH2}${option?.query ? `?${dataToURLString(option.query)}` : ''}`
    },
    users: {
      _userId: (val0: number) => {
        const prefix0 = `${PATH4}/${val0}`

        return {
          get: (option?: { config?: T }) =>
            fetch<Methods6['get']['resBody']>(prefix, prefix0, GET, option).json(),
          $get: (option?: { config?: T }) =>
            fetch<Methods6['get']['resBody']>(prefix, prefix0, GET, option).json().then(r => r.body),
          $path: () => `${prefix}${prefix0}`
        }
      },
      get: (option?: { config?: T }) =>
        fetch<Methods5['get']['resBody']>(prefix, PATH4, GET, option).json(),
      $get: (option?: { config?: T }) =>
        fetch<Methods5['get']['resBody']>(prefix, PATH4, GET, option).json().then(r => r.body),
      post: (option: { body: Methods5['post']['reqBody'], config?: T }) =>
        fetch<void>(prefix, PATH4, POST, option).send(),
      $post: (option: { body: Methods5['post']['reqBody'], config?: T }) =>
        fetch<void>(prefix, PATH4, POST, option).send().then(r => r.body),
      $path: () => `${prefix}${PATH4}`
    },
    get: (option?: { query?: Methods0['get']['query'], config?: T }) =>
      fetch<Methods0['get']['resBody'], BasicHeaders, Methods0['get']['status']>(prefix, '', GET, option).json(),
    $get: (option?: { query?: Methods0['get']['query'], config?: T }) =>
      fetch<Methods0['get']['resBody'], BasicHeaders, Methods0['get']['status']>(prefix, '', GET, option).json().then(r => r.body),
    post: (option: { body: Methods0['post']['reqBody'], query: Methods0['post']['query'], config?: T }) =>
      fetch<Methods0['post']['resBody'], BasicHeaders, Methods0['post']['status']>(prefix, '', POST, option, 'FormData').json(),
    $post: (option: { body: Methods0['post']['reqBody'], query: Methods0['post']['query'], config?: T }) =>
      fetch<Methods0['post']['resBody'], BasicHeaders, Methods0['post']['status']>(prefix, '', POST, option, 'FormData').json().then(r => r.body),
    $path: (option?: { method?: 'get'; query: Methods0['get']['query'] } | { method: 'post'; query: Methods0['post']['query'] }) =>
      `${prefix}${''}${option?.query ? `?${dataToURLString(option.query)}` : ''}`
  }
}

export type ApiInstance = ReturnType<typeof api>
export default api

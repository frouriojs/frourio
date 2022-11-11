import type { AspidaClient, BasicHeaders } from 'aspida'
import { dataToURLString } from 'aspida'
import type { Methods as Methods0 } from '.'
import type { Methods as Methods1 } from './500'
import type { Methods as Methods2 } from './empty/noEmpty'
import type { Methods as Methods3 } from './multiForm'
import type { Methods as Methods4 } from './texts'
import type { Methods as Methods5 } from './texts/_label@string'
import type { Methods as Methods6 } from './texts/sample'
import type { Methods as Methods7 } from './users'
import type { Methods as Methods8 } from './users/_userId@number'
import type { Methods as Methods9 } from './users/_userId@number/_name'

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/500'
  const PATH1 = '/empty/noEmpty'
  const PATH2 = '/multiForm'
  const PATH3 = '/texts'
  const PATH4 = '/texts/sample'
  const PATH5 = '/users'
  const GET = 'GET'
  const POST = 'POST'
  const PUT = 'PUT'

  return {
    $500: {
      get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods1['get']['resBody']>(prefix, PATH0, GET, option).text(),
      $get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods1['get']['resBody']>(prefix, PATH0, GET, option).text().then(r => r.body),
      $path: () => `${prefix}${PATH0}`
    },
    empty: {
      noEmpty: {
        get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods2['get']['resBody']>(prefix, PATH1, GET, option).text(),
        $get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods2['get']['resBody']>(prefix, PATH1, GET, option).text().then(r => r.body),
        $path: () => `${prefix}${PATH1}`
      }
    },
    multiForm: {
      post: (option: { body: Methods3['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods3['post']['resBody']>(prefix, PATH2, POST, option, 'FormData').json(),
      $post: (option: { body: Methods3['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods3['post']['resBody']>(prefix, PATH2, POST, option, 'FormData').json().then(r => r.body),
      $path: () => `${prefix}${PATH2}`
    },
    texts: {
      _label: (val1: string) => {
        const prefix1 = `${PATH3}/${val1}`

        return {
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods5['get']['resBody']>(prefix, prefix1, GET, option).text(),
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods5['get']['resBody']>(prefix, prefix1, GET, option).text().then(r => r.body),
          $path: () => `${prefix}${prefix1}`
        }
      },
      sample: {
        put: (option: { body: Methods6['put']['reqBody'], config?: T | undefined }) =>
          fetch<Methods6['put']['resBody']>(prefix, PATH4, PUT, option).json(),
        $put: (option: { body: Methods6['put']['reqBody'], config?: T | undefined }) =>
          fetch<Methods6['put']['resBody']>(prefix, PATH4, PUT, option).json().then(r => r.body),
        $path: () => `${prefix}${PATH4}`
      },
      get: (option?: { query?: Methods4['get']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods4['get']['resBody']>(prefix, PATH3, GET, option).text(),
      $get: (option?: { query?: Methods4['get']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods4['get']['resBody']>(prefix, PATH3, GET, option).text().then(r => r.body),
      put: (option?: { config?: T | undefined } | undefined) =>
        fetch(prefix, PATH3, PUT, option).send(),
      $put: (option?: { config?: T | undefined } | undefined) =>
        fetch(prefix, PATH3, PUT, option).send().then(r => r.body),
      $path: (option?: { method?: 'get' | undefined; query: Methods4['get']['query'] } | undefined) =>
        `${prefix}${PATH3}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
    },
    users: {
      _userId: (val1: number) => {
        const prefix1 = `${PATH5}/${val1}`

        return {
          _name: (val2: number | string) => {
            const prefix2 = `${prefix1}/${val2}`

            return {
              get: (option?: { config?: T | undefined } | undefined) =>
                fetch<Methods9['get']['resBody']>(prefix, prefix2, GET, option).text(),
              $get: (option?: { config?: T | undefined } | undefined) =>
                fetch<Methods9['get']['resBody']>(prefix, prefix2, GET, option).text().then(r => r.body),
              $path: () => `${prefix}${prefix2}`
            }
          },
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods8['get']['resBody']>(prefix, prefix1, GET, option).json(),
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods8['get']['resBody']>(prefix, prefix1, GET, option).json().then(r => r.body),
          $path: () => `${prefix}${prefix1}`
        }
      },
      get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods7['get']['resBody']>(prefix, PATH5, GET, option).json(),
      $get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods7['get']['resBody']>(prefix, PATH5, GET, option).json().then(r => r.body),
      post: (option: { body: Methods7['post']['reqBody'], config?: T | undefined }) =>
        fetch(prefix, PATH5, POST, option).send(),
      $post: (option: { body: Methods7['post']['reqBody'], config?: T | undefined }) =>
        fetch(prefix, PATH5, POST, option).send().then(r => r.body),
      $path: () => `${prefix}${PATH5}`
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
      `${prefix}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
  }
}

export type ApiInstance = ReturnType<typeof api>
export default api

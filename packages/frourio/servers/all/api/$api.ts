/* eslint-disable */
import { AspidaClient, BasicHeaders } from 'aspida'
import { Methods as Methods0 } from '.'
import { Methods as Methods1 } from './500'
import { Methods as Methods2 } from './empty/noEmpty'
import { Methods as Methods3 } from './multiForm'
import { Methods as Methods4 } from './texts'
import { Methods as Methods5 } from './texts/sample'
import { Methods as Methods6 } from './users'
import { Methods as Methods7 } from './users/_userId@number'

const GET = 'GET'
const POST = 'POST'
const PUT = 'PUT'
const PATH0 = '/500'
const PATH1 = '/empty/noEmpty'
const PATH2 = '/multiForm'
const PATH3 = '/texts'
const PATH4 = '/texts/sample'
const PATH5 = '/users'
const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')

  return {
    $500: {
      get: (option?: { config?: T }) =>
        fetch<Methods1['get']['resBody']>(prefix, PATH0, GET, option).text(),
      $get: (option?: { config?: T }) =>
        fetch<Methods1['get']['resBody']>(prefix, PATH0, GET, option).text().then(r => r.body)
    },
    empty: {
      noEmpty: {
        get: (option?: { config?: T }) =>
          fetch<Methods2['get']['resBody']>(prefix, PATH1, GET, option).text(),
        $get: (option?: { config?: T }) =>
          fetch<Methods2['get']['resBody']>(prefix, PATH1, GET, option).text().then(r => r.body)
      }
    },
    multiForm: {
      post: (option: { body: Methods3['post']['reqBody'], config?: T }) =>
        fetch<Methods3['post']['resBody']>(prefix, PATH2, POST, option, 'FormData').json(),
      $post: (option: { body: Methods3['post']['reqBody'], config?: T }) =>
        fetch<Methods3['post']['resBody']>(prefix, PATH2, POST, option, 'FormData').json().then(r => r.body)
    },
    texts: {
      sample: {
        put: (option: { body: Methods5['put']['reqBody'], config?: T }) =>
          fetch<Methods5['put']['resBody']>(prefix, PATH4, PUT, option).json(),
        $put: (option: { body: Methods5['put']['reqBody'], config?: T }) =>
          fetch<Methods5['put']['resBody']>(prefix, PATH4, PUT, option).json().then(r => r.body)
      },
      get: (option: { query: Methods4['get']['query'], config?: T }) =>
        fetch<Methods4['get']['resBody']>(prefix, PATH3, GET, option).text(),
      $get: (option: { query: Methods4['get']['query'], config?: T }) =>
        fetch<Methods4['get']['resBody']>(prefix, PATH3, GET, option).text().then(r => r.body),
      put: (option?: { config?: T }) =>
        fetch<void>(prefix, PATH3, PUT, option).send(),
      $put: (option?: { config?: T }) =>
        fetch<void>(prefix, PATH3, PUT, option).send().then(r => r.body)
    },
    users: {
      _userId: (val0: number) => {
        const prefix0 = `${PATH5}/${val0}`

        return {
          get: (option?: { config?: T }) =>
            fetch<Methods7['get']['resBody']>(prefix, prefix0, GET, option).json(),
          $get: (option?: { config?: T }) =>
            fetch<Methods7['get']['resBody']>(prefix, prefix0, GET, option).json().then(r => r.body)
        }
      },
      get: (option?: { config?: T }) =>
        fetch<Methods6['get']['resBody']>(prefix, PATH5, GET, option).json(),
      $get: (option?: { config?: T }) =>
        fetch<Methods6['get']['resBody']>(prefix, PATH5, GET, option).json().then(r => r.body),
      post: (option: { body: Methods6['post']['reqBody'], config?: T }) =>
        fetch<void>(prefix, PATH5, POST, option).send(),
      $post: (option: { body: Methods6['post']['reqBody'], config?: T }) =>
        fetch<void>(prefix, PATH5, POST, option).send().then(r => r.body)
    },
    get: (option?: { query?: Methods0['get']['query'], config?: T }) =>
      fetch<Methods0['get']['resBody'], BasicHeaders, Methods0['get']['status']>(prefix, '', GET, option).json(),
    $get: (option?: { query?: Methods0['get']['query'], config?: T }) =>
      fetch<Methods0['get']['resBody'], BasicHeaders, Methods0['get']['status']>(prefix, '', GET, option).json().then(r => r.body),
    post: (option: { body: Methods0['post']['reqBody'], query: Methods0['post']['query'], config?: T }) =>
      fetch<Methods0['post']['resBody'], BasicHeaders, Methods0['post']['status']>(prefix, '', POST, option, 'FormData').json(),
    $post: (option: { body: Methods0['post']['reqBody'], query: Methods0['post']['query'], config?: T }) =>
      fetch<Methods0['post']['resBody'], BasicHeaders, Methods0['post']['status']>(prefix, '', POST, option, 'FormData').json().then(r => r.body)
  }
}

export type ApiInstance = ReturnType<typeof api>
export default api

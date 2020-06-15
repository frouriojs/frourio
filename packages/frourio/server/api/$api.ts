/* eslint-disable */
import { AspidaClient, BasicHeaders } from 'aspida'
import { Methods as Methods0 } from './index'
import { Methods as Methods1 } from './multiForm/index'
import { Methods as Methods2 } from './texts/index'
import { Methods as Methods3 } from './texts/sample/index'
import { Methods as Methods4 } from './users/index'
import { Methods as Methods5 } from './users/_userId@number/index'

const api = <T>(client: AspidaClient<T>) => {
  const prefix = (client.baseURL === undefined ? '' : client.baseURL).replace(/\/$/, '')

  return {
    multiForm: {
      post: (option: { body: Methods1['post']['reqBody'], config?: T }) =>
        client.fetch<Methods1['post']['resBody']>(prefix, '/multiForm', 'POST', option, 'FormData').json(),
      $post: async (option: { body: Methods1['post']['reqBody'], config?: T }) =>
        (await client.fetch<Methods1['post']['resBody']>(prefix, '/multiForm', 'POST', option, 'FormData').json()).body
    },
    texts: {
      sample: {
        put: (option: { body: Methods3['put']['reqBody'], config?: T }) =>
          client.fetch<Methods3['put']['resBody']>(prefix, '/texts/sample', 'PUT', option).json(),
        $put: async (option: { body: Methods3['put']['reqBody'], config?: T }) =>
          (await client.fetch<Methods3['put']['resBody']>(prefix, '/texts/sample', 'PUT', option).json()).body
      },
      get: (option: { query: Methods2['get']['query'], config?: T }) =>
        client.fetch<Methods2['get']['resBody']>(prefix, '/texts', 'GET', option).text(),
      $get: async (option: { query: Methods2['get']['query'], config?: T }) =>
        (await client.fetch<Methods2['get']['resBody']>(prefix, '/texts', 'GET', option).text()).body,
      put: (option?: { config?: T }) =>
        client.fetch<void>(prefix, '/texts', 'PUT', option).send(),
      $put: async (option?: { config?: T }) =>
        (await client.fetch<void>(prefix, '/texts', 'PUT', option).send()).body
    },
    users: {
      _userId: (val0: number) => ({
        get: (option?: { config?: T }) =>
          client.fetch<Methods5['get']['resBody']>(prefix, `/users/${val0}`, 'GET', option).json(),
        $get: async (option?: { config?: T }) =>
          (await client.fetch<Methods5['get']['resBody']>(prefix, `/users/${val0}`, 'GET', option).json()).body
      }),
      get: (option?: { config?: T }) =>
        client.fetch<Methods4['get']['resBody']>(prefix, '/users', 'GET', option).json(),
      $get: async (option?: { config?: T }) =>
        (await client.fetch<Methods4['get']['resBody']>(prefix, '/users', 'GET', option).json()).body,
      post: (option: { body: Methods4['post']['reqBody'], config?: T }) =>
        client.fetch<void>(prefix, '/users', 'POST', option).send(),
      $post: async (option: { body: Methods4['post']['reqBody'], config?: T }) =>
        (await client.fetch<void>(prefix, '/users', 'POST', option).send()).body
    },
    get: (option?: { query?: Methods0['get']['query'], config?: T }) =>
      client.fetch<Methods0['get']['resBody'], BasicHeaders, Methods0['get']['status']>(prefix, '', 'GET', option).json(),
    $get: async (option?: { query?: Methods0['get']['query'], config?: T }) =>
      (await client.fetch<Methods0['get']['resBody'], BasicHeaders, Methods0['get']['status']>(prefix, '', 'GET', option).json()).body,
    post: (option: { body: Methods0['post']['reqBody'], query: Methods0['post']['query'], config?: T }) =>
      client.fetch<Methods0['post']['resBody'], BasicHeaders, Methods0['post']['status']>(prefix, '', 'POST', option, 'FormData').json(),
    $post: async (option: { body: Methods0['post']['reqBody'], query: Methods0['post']['query'], config?: T }) =>
      (await client.fetch<Methods0['post']['resBody'], BasicHeaders, Methods0['post']['status']>(prefix, '', 'POST', option, 'FormData').json()).body
  }
}

export type ApiInstance = ReturnType<typeof api>
export default api

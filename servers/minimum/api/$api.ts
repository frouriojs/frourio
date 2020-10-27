/* eslint-disable */
import { AspidaClient } from 'aspida'
import { Methods as Methods0 } from '.'

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')

  const GET = 'GET'

  return {
    get: (option?: { config?: T }) =>
      fetch<Methods0['get']['resBody']>(prefix, '', GET, option).json(),
    $get: (option?: { config?: T }) =>
      fetch<Methods0['get']['resBody']>(prefix, '', GET, option).json().then(r => r.body),
    $path: () => `${prefix}${''}`
  }
}

export type ApiInstance = ReturnType<typeof api>
export default api

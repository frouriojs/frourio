import type { DefineMethods } from 'aspida'

export type Methods = DefineMethods<{
  get: {
    query: {
      val: string
    }
    resBody: string
  }

  put: {}
}>

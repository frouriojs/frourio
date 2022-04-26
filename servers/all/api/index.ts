import type { DefineMethods } from 'aspida'
import { Query, Body } from 'validators'

export type Methods = DefineMethods<{
  get: {
    query?: Query
    status: 200
    resBody?: Query
  }

  post: {
    query: Query
    reqFormat: FormData
    reqBody: Body
    status: 201
    resBody: {
      id: number
      port: string
      fileName: string
    }
  }
}>

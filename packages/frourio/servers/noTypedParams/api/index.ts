import { Query, Body } from '../validators'

export type Methods = {
  get: {
    query?: Query
    status: 200
    resBody?: { id: number }
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
}

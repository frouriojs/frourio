import { ValidQuery, ValidBody } from '../types'

export type Methods = {
  get: {
    query?: ValidQuery
    status: 200
    resBody?: { id: number }
  }

  post: {
    query: ValidQuery
    reqFormat: FormData
    reqBody: ValidBody
    status: 201
    resBody: {
      id: number
      port: string
      fileName: string
    }
  }
}

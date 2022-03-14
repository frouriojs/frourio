import { Query, Body } from 'validators'

export type Methods = {
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
      title: string
      fileName: string
      /** only for testing purpose */
      _bodyType: string
    }
  }
}

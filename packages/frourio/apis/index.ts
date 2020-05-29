import { Validator } from 'frourio'

export class ValidQuery {
  @Validator.IsNumberString()
  id: string

  @Validator.IsBooleanString()
  disable: string
}

export class ValidBody {
  @Validator.IsPort()
  port: string

  file: File
}

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

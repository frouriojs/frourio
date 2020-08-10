import { ValidMultiForm } from '../../types'

export type Methods = {
  post: {
    reqFormat: FormData
    reqBody: ValidMultiForm
    resBody: {
      empty: number
      name: number
      icon: number
      vals: number
      files: number
    }
  }
}

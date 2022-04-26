import type { DefineMethods } from 'aspida'
import { MultiForm } from '../../validators'

export type Methods = DefineMethods<{
  post: {
    reqFormat: FormData
    reqBody: MultiForm
    resBody: {
      empty: number
      name: number
      icon: number
      vals: number
      files: number
    }
  }
}>

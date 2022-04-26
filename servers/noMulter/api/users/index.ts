import type { DefineMethods } from 'aspida'
import { UserInfo } from '../../validators'

export type Methods = DefineMethods<{
  get: {
    resBody: UserInfo[]
  }

  post: {
    reqBody: UserInfo
  }
}>

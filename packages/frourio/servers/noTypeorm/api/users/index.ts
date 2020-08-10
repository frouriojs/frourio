import { ValidUserInfo } from '../../types'

export type Methods = {
  get: {
    resBody: ValidUserInfo[]
  }

  post: {
    reqBody: ValidUserInfo
  }
}

export type UserInfo = {
  id: number
  name: string
}

export type Methods = {
  get: {
    resBody: UserInfo[]
  }
}

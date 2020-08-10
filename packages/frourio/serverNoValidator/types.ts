export type Query = {
  id: string
  disable: string
}

export type Body = {
  port: string
  file: File
}

export class UserInfo {
  id: number
  name: string
}

export class MultiForm {
  empty: number[]
  name: string
  icon: Blob
  vals: string[]
  files: Blob[]
}

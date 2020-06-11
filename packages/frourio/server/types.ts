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

export class ValidUserInfo {
  @Validator.IsInt()
  id: number

  @Validator.MaxLength(20)
  name: string
}

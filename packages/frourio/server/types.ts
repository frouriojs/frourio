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

export class ValidMultiForm {
  @Validator.IsInt({ each: true })
  empty: number[]

  @Validator.IsString()
  name: string

  @Validator.Allow()
  icon: Blob

  @Validator.IsString({ each: true })
  vals: string[]

  @Validator.ArrayNotEmpty()
  files: Blob[]
}

import {
  IsNumberString,
  IsBooleanString,
  IsPort,
  IsInt,
  MaxLength,
  IsString,
  Allow,
  ArrayNotEmpty
} from 'class-validator'

export class ValidQuery {
  @IsNumberString()
  id: string

  @IsBooleanString()
  disable: string
}

export class ValidBody {
  @IsPort()
  port: string

  file: File
}

export class ValidUserInfo {
  @IsInt()
  id: number

  @MaxLength(20)
  name: string
}

export class ValidMultiForm {
  @IsInt({ each: true })
  empty: number[]

  @IsString()
  name: string

  @Allow()
  icon: Blob

  @IsString({ each: true })
  vals: string[]

  @ArrayNotEmpty()
  files: Blob[]
}

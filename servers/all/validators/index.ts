import {
  IsNumberString,
  IsBooleanString,
  IsPort,
  IsInt,
  MaxLength,
  IsString,
  Allow,
  IsOptional,
  ArrayNotEmpty
} from 'class-validator'

export class Query {
  requiredNum: number
  optionalNum?: number
  optionalNumArr?: Array<number>

  @IsOptional()
  emptyNum?: number

  @IsInt({ each: true })
  requiredNumArr: number[]

  @IsNumberString()
  id: string

  @IsBooleanString()
  disable: string
}

export class Body {
  @IsPort()
  port: string

  file: File
}

export class UserInfo {
  @IsInt()
  id: number

  @MaxLength(20)
  name: string
}

export class MultiForm {
  requiredArr: string[]
  optionalArr?: string[]

  @IsOptional()
  @IsInt({ each: true })
  empty?: number[]

  @IsString()
  name: string

  @Allow()
  icon: Blob

  @IsString({ each: true })
  vals: string[]

  @ArrayNotEmpty()
  files: Blob[]
}

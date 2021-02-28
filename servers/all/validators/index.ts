import {
  IsNumberString,
  IsBooleanString,
  IsBoolean,
  IsPort,
  IsInt,
  MaxLength,
  IsString,
  Allow,
  IsOptional,
  ArrayNotEmpty
} from 'class-validator'
import type { ReadStream } from 'fs'

export class Query {
  requiredNum: number
  optionalNum?: number
  optionalNumArr?: Array<number>

  @IsOptional()
  @IsInt()
  emptyNum?: number

  @IsInt({ each: true })
  requiredNumArr: number[]

  @IsNumberString()
  id: string

  @IsBooleanString()
  disable: string

  @IsBoolean()
  bool: boolean

  @IsOptional()
  @IsBoolean()
  optionalBool?: boolean

  @IsBoolean({ each: true })
  boolArray: boolean[]

  @IsOptional()
  @IsBoolean({ each: true })
  optionalBoolArray?: boolean[]
}

export class Body {
  @IsPort()
  port: string

  file: File | ReadStream
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

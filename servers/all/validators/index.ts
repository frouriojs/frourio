import { Type } from 'class-transformer'
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
  ArrayNotEmpty,
  IsISO31661Alpha2,
  ValidateNested,
  IsObject
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

export class UserInfoLocation {
  @IsISO31661Alpha2()
  country: string

  @IsString()
  stateProvince: string
}

export class UserInfo {
  @IsInt()
  id: number

  @MaxLength(20)
  name: string

  // @Type decorator is required to validate nested object properly
  // @IsObject decorator is required or class-validator will not throw an error when the property is missing
  @ValidateNested()
  @IsObject()
  @Type(() => UserInfoLocation)
  location: UserInfoLocation
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

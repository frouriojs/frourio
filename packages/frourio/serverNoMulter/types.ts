import { IsNumberString, IsBooleanString, IsPort, IsInt, MaxLength } from 'class-validator'

export class ValidQuery {
  @IsNumberString()
  id: string

  @IsBooleanString()
  disable: string
}

export class ValidBody {
  @IsPort()
  port: string
}

export class ValidUserInfo {
  @IsInt()
  id: number

  @MaxLength(20)
  name: string
}

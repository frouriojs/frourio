import { IsNumberString, IsBooleanString, IsPort, IsInt, MaxLength } from 'class-validator';

export class Query {
  @IsNumberString()
  id: string;

  @IsBooleanString()
  disable: string;
}

export class Body {
  @IsPort()
  port: string;
}

export class UserInfo {
  @IsInt()
  id: number;

  @MaxLength(20)
  name: string;
}

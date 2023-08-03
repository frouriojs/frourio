import {
  Allow,
  ArrayNotEmpty,
  IsBooleanString,
  IsInt,
  IsNumberString,
  IsPort,
  IsString,
  MaxLength,
} from 'class-validator';

export class Query {
  @IsNumberString()
  id: string;

  @IsBooleanString()
  disable: string;
}

export class Body {
  @IsPort()
  port: string;

  file: File;
}

export class UserInfo {
  @IsInt()
  id: number;

  @MaxLength(20)
  name: string;
}

export class MultiForm {
  @IsInt({ each: true })
  empty: number[];

  @IsString()
  name: string;

  @Allow()
  icon: Blob;

  @IsString({ each: true })
  vals: string[];

  @ArrayNotEmpty()
  files: Blob[];
}

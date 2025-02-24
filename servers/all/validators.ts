import type { ReadStream } from 'fs';
import { z } from 'zod';

const symbolBrand = Symbol();

export type SymbolId = string & { [symbolBrand]: unknown };

export type ZodId = number & z.BRAND<'ZodId'>;

export type MaybeId = ZodId | (number & z.BRAND<'maybe'>);

export type Query = {
  requiredNum: number;
  optionalNum?: number | undefined;
  optionalNumArr?: Array<number> | undefined;
  emptyNum?: number | undefined;
  requiredNumArr: number[];
  id: string;
  strArray: string[];
  optionalStrArray?: string[] | undefined;
  disable: string;
  bool: boolean;
  optionalBool?: boolean | undefined;
  boolArray: boolean[];
  optionalBoolArray?: boolean[] | undefined;
  symbolIds: SymbolId[];
  optionalZodIds?: ZodId[] | undefined;
  maybeIds: MaybeId[];
};

export type Body = {
  port: string;
  file: File | ReadStream;
  requiredNum: number;
  optionalNum?: number | undefined;
  optionalNumArr?: Array<number> | undefined;
  emptyNum?: number | undefined;
  requiredNumArr: number[];
  bool: boolean;
  optionalBool?: boolean | undefined;
  boolArray: boolean[];
  optionalBoolArray?: boolean[] | undefined;
};

export type UserInfo = {
  id: number;
  name: string;
  location: {
    country: string;
    stateProvince: string;
  };
};

export type MultiForm = {
  requiredArr: string[];
  optionalArr?: string[] | undefined;
  empty?: number[] | undefined;
  name: string;
  icon: Blob;
  vals: string[];
  files: Blob[];
};

export const queryValidator: z.ZodType<Query> = z.object({
  requiredNum: z.number(),
  optionalNum: z.number().optional(),
  optionalNumArr: z.array(z.number()).optional(),
  emptyNum: z.number().optional(),
  requiredNumArr: z.array(z.number()),
  id: z.string().regex(/^\d+$/),
  strArray: z.array(z.string()),
  optionalStrArray: z.array(z.string()).optional(),
  disable: z.enum(['true', 'false']),
  bool: z.boolean(),
  optionalBool: z.boolean().optional(),
  boolArray: z.array(z.boolean()),
  optionalBoolArray: z.array(z.boolean()).optional(),
  symbolIds: z.custom<SymbolId[]>(val => z.array(z.string()).safeParse(val).success),
  optionalZodIds: z.custom<ZodId[]>(val => z.array(z.number()).safeParse(val).success).optional(),
  maybeIds: z.custom<MaybeId[]>(val => z.array(z.number()).safeParse(val).success),
});

export const userInfoValidator: z.ZodType<UserInfo> = z.object({
  id: z.number(),
  name: z.string(),
  location: z.object({
    country: z.string().length(2),
    stateProvince: z.string(),
  }),
});

export const multiFormValidator: z.ZodType<MultiForm> = z.object({
  requiredArr: z.array(z.string()),
  optionalArr: z.array(z.string()).optional(),
  empty: z.array(z.number()).optional(),
  name: z.string(),
  icon: z.instanceof(Blob),
  vals: z.array(z.string()),
  files: z.array(z.instanceof(Blob)),
});

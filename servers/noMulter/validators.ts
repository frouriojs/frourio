import { z } from 'zod';

export type Query = {
  id: string;
  disable: string;
};

export type Body = {
  port: string;
  file: File;
};

export type UserInfo = {
  id: number;
  name: string;
};

export type MultiForm = {
  empty: number[];
  name: string;
  icon: Blob;
  vals: string[];
  files: Blob[];
};

export const queryValidator: z.ZodType<Query> = z.object({
  id: z.string(),
  disable: z.string(),
});

export const bodyValidator: z.ZodType<Body> = z.object({
  port: z.string(),
  file: z.instanceof(File),
});

export const userInfoValidator: z.ZodType<UserInfo> = z.object({
  id: z.number(),
  name: z.string(),
});

export const multiFormValidator: z.ZodType<MultiForm> = z.object({
  empty: z.array(z.number()),
  name: z.string(),
  icon: z.instanceof(Blob),
  vals: z.array(z.string()),
  files: z.array(z.instanceof(Blob)),
});

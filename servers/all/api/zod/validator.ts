import { z } from 'zod';
import type { MultipartFileToBlob } from '../../$server';
import { multipartFileValidator } from './$relay';

export const queryValidator = z.object({
  requiredNum: z.number(),
  optionalNum: z.number().optional(),
  optionalNumArr: z.array(z.number()).optional(),
  emptyNum: z.number().int().optional(),
  requiredNumArr: z.array(z.number().int()),
  id: z.string(),
  disable: z.string(),
  bool: z.boolean(),
  optionalBool: z.boolean().optional(),
  boolArray: z.array(z.boolean()),
  optionalBoolArray: z.array(z.boolean()).optional(),
});

export type QueryValidator = z.infer<typeof queryValidator>;

export const bodyValidator = z.object({
  requiredArr: z.array(z.string()),
  optionalArr: z.array(z.string()).optional(),
  empty: z.array(z.number().int()).optional(),
  name: z.string(),
  icon: multipartFileValidator(),
  vals: z.array(z.number()),
  files: z.array(multipartFileValidator()),
});

export type BodyValidator = MultipartFileToBlob<z.infer<typeof bodyValidator>>;

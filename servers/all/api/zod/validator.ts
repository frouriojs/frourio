import { BusboyFileStream } from '@fastify/busboy'
import { MultipartFile } from '@fastify/multipart'
import type { ReadStream } from 'fs'
import { Readable } from 'stream'
import { z } from 'zod'

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
  optionalBoolArray: z.array(z.boolean()).optional()
})

export type QueryValidator = z.infer<typeof queryValidator>

const multipartValidator = z.object({
  type: z.literal('file'),
  toBuffer: z.function().returns(z.promise(z.instanceof(Buffer))),
  file: z
    .instanceof(Readable)
    .and(
      z.object({ truncated: z.boolean(), bytesRead: z.number() })
    ) satisfies z.ZodType<BusboyFileStream>,
  fieldname: z.string(),
  filename: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  fields: z.record(z.any())
}) satisfies z.ZodType<MultipartFile>

export const bodyValidator = z.object({
  requiredArr: z.array(z.string()),
  optionalArr: z.array(z.string()).optional(),
  empty: z.array(z.number().int()).optional(),
  name: z.string(),
  icon: multipartValidator,
  vals: z.array(z.number()),
  files: z.array(multipartValidator)
})

type MultipartToBlob<T extends Record<string, unknown>> = {
  [P in keyof T]: Required<T>[P] extends MultipartFile
    ? Blob | ReadStream
    : Required<T>[P] extends MultipartFile[]
    ? (Blob | ReadStream)[]
    : T[P]
}

export type BodyValidator = MultipartToBlob<z.infer<typeof bodyValidator>>

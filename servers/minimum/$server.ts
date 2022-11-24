import type { HttpStatusOk, AspidaMethodParams } from 'aspida'
import type { z } from 'zod'
import controllerFn0, { responseSchema as responseSchemaFn0 } from './api/controller'

import type { FastifyInstance, RouteHandlerMethod, FastifySchema, FastifySchemaCompiler } from 'fastify'

export type FrourioOptions = {
  basePath?: string | undefined
}

type HttpStatusNoOk = 301 | 302 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 409 | 500 | 501 | 502 | 503 | 504 | 505

type PartiallyPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type BaseResponse<T, U, V> = {
  status: V extends number ? V : HttpStatusOk
  body: T
  headers: U
}

type ServerResponse<K extends AspidaMethodParams> =
  | (K extends { resBody: K['resBody']; resHeaders: K['resHeaders'] }
  ? BaseResponse<K['resBody'], K['resHeaders'], K['status']>
  : K extends { resBody: K['resBody'] }
  ? PartiallyPartial<BaseResponse<K['resBody'], K['resHeaders'], K['status']>, 'headers'>
  : K extends { resHeaders: K['resHeaders'] }
  ? PartiallyPartial<BaseResponse<K['resBody'], K['resHeaders'], K['status']>, 'body'>
  : PartiallyPartial<
      BaseResponse<K['resBody'], K['resHeaders'], K['status']>,
      'body' | 'headers'
    >)
  | PartiallyPartial<BaseResponse<any, any, HttpStatusNoOk>, 'body' | 'headers'>

type RequestParams<T extends AspidaMethodParams> = Pick<{
  query: T['query']
  body: T['reqBody']
  headers: T['reqHeaders']
}, {
  query: Required<T>['query'] extends {} | null ? 'query' : never
  body: Required<T>['reqBody'] extends {} | null ? 'body' : never
  headers: Required<T>['reqHeaders'] extends {} | null ? 'headers' : never
}['query' | 'body' | 'headers']>

type ServerHandler<T extends AspidaMethodParams, U extends Record<string, any> = {}> = (
  req: RequestParams<T> & U
) => ServerResponse<T>

type ServerHandlerPromise<T extends AspidaMethodParams, U extends Record<string, any> = {}> = (
  req: RequestParams<T> & U
) => Promise<ServerResponse<T>>

export type ServerMethodHandler<T extends AspidaMethodParams,  U extends Record<string, any> = {}> = ServerHandler<T, U> | ServerHandlerPromise<T, U> | {
  validators?: Partial<{ [Key in keyof RequestParams<T>]?: z.ZodType<RequestParams<T>[Key]>}>
  handler: ServerHandler<T, U> | ServerHandlerPromise<T, U>
}

const validatorCompiler: FastifySchemaCompiler<FastifySchema> = ({ schema }) => (data: unknown) => {
  const result = (schema as z.ZodType<unknown>).safeParse(data)
  return result.success ? { value: result.data } : { error: result.error }
}

const methodToHandler = (
  methodCallback: ServerHandler<any, any>
): RouteHandlerMethod => (req, reply) => {
  const data = methodCallback(req as any) as any

  if (data.headers) reply.headers(data.headers)

  reply.code(data.status).send(data.body)
}

export default (fastify: FastifyInstance, options: FrourioOptions = {}) => {
  const basePath = options.basePath ?? ''
  const responseSchema0 = responseSchemaFn0()
  const controller0 = controllerFn0(fastify)

  fastify.get(
    basePath || '/',
    {
      schema: {
        response: responseSchema0.get
      },
      validatorCompiler
    },
    methodToHandler(controller0.get)
  )

  return fastify
}

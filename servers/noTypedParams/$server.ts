import 'reflect-metadata'
import type { ClassTransformOptions } from 'class-transformer'
import { plainToInstance as defaultPlainToInstance } from 'class-transformer'
import type { ValidatorOptions } from 'class-validator'
import { validateOrReject as defaultValidateOrReject } from 'class-validator'
import type { FastifyMultipartAttactFieldsToBodyOptions, Multipart } from 'fastify-multipart'
import multipart from 'fastify-multipart'
import * as Validators from './validators'
import type { ReadStream } from 'fs'
import type { LowerHttpMethod, AspidaMethods, HttpStatusOk, AspidaMethodParams } from 'aspida'
import hooksFn0 from './api/hooks'
import hooksFn1 from './api/users/hooks'
import controllerFn0, { hooks as ctrlHooksFn0 } from './api/controller'
import controllerFn1 from './api/empty/noEmpty/controller'
import controllerFn2 from './api/multiForm/controller'
import controllerFn3 from './api/texts/controller'
import controllerFn4 from './api/texts/sample/controller'
import controllerFn5, { hooks as ctrlHooksFn1 } from './api/users/controller'

import type { FastifyInstance, RouteHandlerMethod, preValidationHookHandler, FastifyRequest, RouteShorthandOptions } from 'fastify'

export type FrourioOptions = {
  basePath?: string
  transformer?: ClassTransformOptions
  validator?: ValidatorOptions
  plainToInstance?: (cls: new (...args: any[]) => object, object: unknown, options: ClassTransformOptions) => object
  validateOrReject?: (instance: object, options: ValidatorOptions) => Promise<void>
  multipart?: FastifyMultipartAttactFieldsToBodyOptions
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

type BlobToFile<T extends AspidaMethodParams> = T['reqFormat'] extends FormData
  ? {
      [P in keyof T['reqBody']]: Required<T['reqBody']>[P] extends Blob | ReadStream
        ? Multipart
        : Required<T['reqBody']>[P] extends (Blob | ReadStream)[]
        ? Multipart[]
        : T['reqBody'][P]
    }
  : T['reqBody']

type RequestParams<T extends AspidaMethodParams> = Pick<{
  query: T['query']
  body: BlobToFile<T>
  headers: T['reqHeaders']
}, {
  query: Required<T>['query'] extends {} | null ? 'query' : never
  body: Required<T>['reqBody'] extends {} | null ? 'body' : never
  headers: Required<T>['reqHeaders'] extends {} | null ? 'headers' : never
}['query' | 'body' | 'headers']>

export type ServerMethods<T extends AspidaMethods, U extends Record<string, any> = {}> = {
  [K in keyof T]: (
    req: RequestParams<T[K]> & U
  ) => ServerResponse<T[K]> | Promise<ServerResponse<T[K]>>
}

const createValidateHandler = (validators: (req: FastifyRequest) => (Promise<void> | null)[]): preValidationHookHandler =>
  (req, reply) => Promise.all(validators(req)).catch(err => reply.code(400).send(err))

const formatMultipartData = (arrayTypeKeys: [string, boolean][]): preValidationHookHandler => (req, _, done) => {
  const body: any = req.body

  for (const [key] of arrayTypeKeys) {
    if (body[key] === undefined) body[key] = []
    else if (!Array.isArray(body[key])) {
      body[key] = [body[key]]
    }
  }

  Object.entries(body).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      body[key] = (val as Multipart[]).map(v => v.file ? v : (v as any).value)
    } else {
      body[key] = (val as Multipart).file ? val : (val as any).value
    }
  })

  for (const [key, isOptional] of arrayTypeKeys) {
    if (!body[key].length && isOptional) delete body[key]
  }

  done()
}

const methodToHandler = (
  methodCallback: ServerMethods<any, any>[LowerHttpMethod]
): RouteHandlerMethod => (req, reply) => {
  const data = methodCallback(req as any) as any

  if (data.headers) reply.headers(data.headers)

  reply.code(data.status).send(data.body)
}

const asyncMethodToHandler = (
  methodCallback: ServerMethods<any, any>[LowerHttpMethod]
): RouteHandlerMethod => async (req, reply) => {
  const data = await methodCallback(req as any) as any

  if (data.headers) reply.headers(data.headers)

  reply.code(data.status).send(data.body)
}

export default (fastify: FastifyInstance, options: FrourioOptions = {}) => {
  const basePath = options.basePath ?? ''
  const transformerOptions: ClassTransformOptions = { enableCircularCheck: true, ...options.transformer }
  const validatorOptions: ValidatorOptions = { validationError: { target: false }, ...options.validator }
  const { plainToInstance = defaultPlainToInstance as NonNullable<FrourioOptions["plainToInstance"]>, validateOrReject = defaultValidateOrReject as NonNullable<FrourioOptions["validateOrReject"]> } = options
  const hooks0 = hooksFn0(fastify)
  const hooks1 = hooksFn1(fastify)
  const ctrlHooks0 = ctrlHooksFn0(fastify)
  const ctrlHooks1 = ctrlHooksFn1(fastify)
  const controller0 = controllerFn0(fastify)
  const controller1 = controllerFn1(fastify)
  const controller2 = controllerFn2(fastify)
  const controller3 = controllerFn3(fastify)
  const controller4 = controllerFn4(fastify)
  const controller5 = controllerFn5(fastify)

  fastify.register(multipart, { attachFieldsToBody: true, limits: { fileSize: 1024 ** 3 }, ...options.multipart })

  fastify.get(
    basePath || '/',
    {
      onRequest: [hooks0.onRequest, ctrlHooks0.onRequest],
      preValidation: createValidateHandler(req => [
          Object.keys(req.query as any).length ? validateOrReject(plainToInstance(Validators.Query, req.query as any, transformerOptions), validatorOptions) : null
        ])
    },
    asyncMethodToHandler(controller0.get)
  )

  fastify.post(
    basePath || '/',
    {
      onRequest: [hooks0.onRequest, ctrlHooks0.onRequest],
      preValidation: [
        formatMultipartData([]),
        createValidateHandler(req => [
          validateOrReject(plainToInstance(Validators.Query, req.query as any, transformerOptions), validatorOptions),
          validateOrReject(plainToInstance(Validators.Body, req.body as any, transformerOptions), validatorOptions)
        ])
      ]
    },
    methodToHandler(controller0.post)
  )

  fastify.get(
    `${basePath}/empty/noEmpty`,
    {
      onRequest: hooks0.onRequest
    },
    methodToHandler(controller1.get)
  )

  fastify.post(
    `${basePath}/multiForm`,
    {
      onRequest: hooks0.onRequest,
      preValidation: [
        formatMultipartData([['empty', false], ['vals', false], ['files', false]]),
        createValidateHandler(req => [
          validateOrReject(plainToInstance(Validators.MultiForm, req.body as any, transformerOptions), validatorOptions)
        ])
      ]
    },
    methodToHandler(controller2.post)
  )

  fastify.get(
    `${basePath}/texts`,
    {
      onRequest: hooks0.onRequest
    },
    methodToHandler(controller3.get)
  )

  fastify.put(
    `${basePath}/texts`,
    {
      onRequest: hooks0.onRequest
    },
    methodToHandler(controller3.put)
  )

  fastify.put(
    `${basePath}/texts/sample`,
    {
      onRequest: hooks0.onRequest
    },
    methodToHandler(controller4.put)
  )

  fastify.get(
    `${basePath}/users`,
    {
      onRequest: [hooks0.onRequest, hooks1.onRequest],
      preHandler: ctrlHooks1.preHandler
    } as RouteShorthandOptions,
    asyncMethodToHandler(controller5.get)
  )

  fastify.post(
    `${basePath}/users`,
    {
      onRequest: [hooks0.onRequest, hooks1.onRequest],
      preValidation: createValidateHandler(req => [
          validateOrReject(plainToInstance(Validators.UserInfo, req.body as any, transformerOptions), validatorOptions)
        ]),
      preHandler: ctrlHooks1.preHandler
    } as RouteShorthandOptions,
    methodToHandler(controller5.post)
  )

  return fastify
}

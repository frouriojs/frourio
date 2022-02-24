import 'reflect-metadata'
import type { ClassTransformOptions } from 'class-transformer'
import { plainToInstance } from 'class-transformer'
import type { ValidatorOptions } from 'class-validator'
import { validateOrReject } from 'class-validator'
import type { FastifyMultipartAttactFieldsToBodyOptions, Multipart } from 'fastify-multipart'
import multipart from 'fastify-multipart'
import * as Validators from './validators'
import type { ReadStream } from 'fs'
import type { LowerHttpMethod, AspidaMethods, HttpStatusOk, AspidaMethodParams } from 'aspida'
import hooksFn0 from './api/hooks'
import hooksFn1 from './api/empty/hooks'
import hooksFn2 from './api/users/hooks'
import hooksFn3 from './api/users/_userId@number/_name/hooks'
import controllerFn0, { hooks as ctrlHooksFn0, responseSchema as responseSchemaFn0 } from './api/controller'
import controllerFn1 from './api/500/controller'
import controllerFn2 from './api/empty/noEmpty/controller'
import controllerFn3 from './api/multiForm/controller'
import controllerFn4 from './api/texts/controller'
import controllerFn5 from './api/texts/sample/controller'
import controllerFn6 from './api/texts/_label@string/controller'
import controllerFn7, { hooks as ctrlHooksFn1 } from './api/users/controller'
import controllerFn8 from './api/users/_userId@number/controller'
import controllerFn9 from './api/users/_userId@number/_name/controller'

import type { FastifyInstance, RouteHandlerMethod, preValidationHookHandler, FastifyRequest, RouteShorthandOptions } from 'fastify'

export type FrourioOptions = {
  basePath?: string
  transformer?: ClassTransformOptions
  validator?: ValidatorOptions
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

const parseNumberTypeQueryParams = (numberTypeParams: [string, boolean, boolean][]): preValidationHookHandler => (req, reply, done) => {
  const query: any = req.query

  for (const [key, isOptional, isArray] of numberTypeParams) {
    const param = isArray ? (query[`${key}[]`] ?? query[key]) : query[key]

    if (isArray) {
      if (!isOptional && param === undefined) {
        query[key] = []
      } else if (!isOptional || param !== undefined) {
        const vals = (Array.isArray(param) ? param : [param]).map(Number)

        if (vals.some(isNaN)) {
          reply.code(400).send()
          return
        }

        query[key] = vals as any
      }

      delete query[`${key}[]`]
    } else if (!isOptional || param !== undefined) {
      const val = Number(param)

      if (isNaN(val)) {
        reply.code(400).send()
        return
      }

      query[key] = val as any
    }
  }

  done()
}

const parseBooleanTypeQueryParams = (booleanTypeParams: [string, boolean, boolean][]): preValidationHookHandler => (req, reply, done) => {
  const query: any = req.query

  for (const [key, isOptional, isArray] of booleanTypeParams) {
    const param = isArray ? (query[`${key}[]`] ?? query[key]) : query[key]

    if (isArray) {
      if (!isOptional && param === undefined) {
        query[key] = []
      } else if (!isOptional || param !== undefined) {
        const vals = (Array.isArray(param) ? param : [param]).map(p => p === 'true' ? true : p === 'false' ? false : null)

        if (vals.some(v => v === null)) {
          reply.code(400).send()
          return
        }

        query[key] = vals as any
      }

      delete query[`${key}[]`]
    } else if (!isOptional || param !== undefined) {
      const val = param === 'true' ? true : param === 'false' ? false : null

      if (val === null) {
        reply.code(400).send()
        return
      }

      query[key] = val as any
    }
  }

  done()
}

const callParserIfExistsQuery = (parser: OmitThisParameter<preValidationHookHandler>): preValidationHookHandler => (req, reply, done) =>
  Object.keys(req.query as any).length ? parser(req, reply, done) : done()

const normalizeQuery: preValidationHookHandler = (req, _, done) => {
  req.query = JSON.parse(JSON.stringify(req.query))
  done()
}

const createTypedParamsHandler = (numberTypeParams: string[]): preValidationHookHandler => (req, reply, done) => {
  const params = req.params as Record<string, string | number>

  for (const key of numberTypeParams) {
    const val = Number(params[key])

    if (isNaN(val)) {
      reply.code(400).send()
      return
    }

    params[key] = val
  }

  done()
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
  const hooks0 = hooksFn0(fastify)
  const hooks1 = hooksFn1(fastify)
  const hooks2 = hooksFn2(fastify)
  const hooks3 = hooksFn3(fastify)
  const ctrlHooks0 = ctrlHooksFn0(fastify)
  const ctrlHooks1 = ctrlHooksFn1(fastify)
  const responseSchema0 = responseSchemaFn0()
  const controller0 = controllerFn0(fastify)
  const controller1 = controllerFn1(fastify)
  const controller2 = controllerFn2(fastify)
  const controller3 = controllerFn3(fastify)
  const controller4 = controllerFn4(fastify)
  const controller5 = controllerFn5(fastify)
  const controller6 = controllerFn6(fastify)
  const controller7 = controllerFn7(fastify)
  const controller8 = controllerFn8(fastify)
  const controller9 = controllerFn9(fastify)

  fastify.register(multipart, { attachFieldsToBody: true, limits: { fileSize: 1024 ** 3 }, ...options.multipart })

  fastify.get(
    basePath || '/',
    {
      schema: { response: responseSchema0.get },
      onRequest: [...hooks0.onRequest, ctrlHooks0.onRequest],
      preParsing: hooks0.preParsing,
      preValidation: [
        callParserIfExistsQuery(parseNumberTypeQueryParams([['requiredNum', false, false], ['optionalNum', true, false], ['optionalNumArr', true, true], ['emptyNum', true, false], ['requiredNumArr', false, true]])),
        callParserIfExistsQuery(parseBooleanTypeQueryParams([['bool', false, false], ['optionalBool', true, false], ['boolArray', false, true], ['optionalBoolArray', true, true]])),
        normalizeQuery,
        createValidateHandler(req => [
          Object.keys(req.query as any).length ? validateOrReject(plainToInstance(Validators.Query, req.query as any, transformerOptions), validatorOptions) : null
        ])
      ]
    },
    asyncMethodToHandler(controller0.get)
  )

  fastify.post(
    basePath || '/',
    {
      onRequest: [...hooks0.onRequest, ctrlHooks0.onRequest],
      preParsing: hooks0.preParsing,
      preValidation: [
        parseNumberTypeQueryParams([['requiredNum', false, false], ['optionalNum', true, false], ['optionalNumArr', true, true], ['emptyNum', true, false], ['requiredNumArr', false, true]]),
        parseBooleanTypeQueryParams([['bool', false, false], ['optionalBool', true, false], ['boolArray', false, true], ['optionalBoolArray', true, true]]),
        formatMultipartData([]),
        normalizeQuery,
        createValidateHandler(req => [
          validateOrReject(plainToInstance(Validators.Query, req.query as any, transformerOptions), validatorOptions),
          validateOrReject(plainToInstance(Validators.Body, req.body as any, transformerOptions), validatorOptions)
        ])
      ]
    },
    methodToHandler(controller0.post)
  )

  fastify.get(
    `${basePath}/500`,
    {
      onRequest: hooks0.onRequest,
      preParsing: hooks0.preParsing
    },
    methodToHandler(controller1.get)
  )

  fastify.get(
    `${basePath}/empty/noEmpty`,
    {
      onRequest: [...hooks0.onRequest, ...hooks1.onRequest],
      preParsing: [hooks0.preParsing, hooks1.preParsing]
    },
    asyncMethodToHandler(controller2.get)
  )

  fastify.post(
    `${basePath}/multiForm`,
    {
      onRequest: hooks0.onRequest,
      preParsing: hooks0.preParsing,
      preValidation: [
        formatMultipartData([['requiredArr', false], ['optionalArr', true], ['empty', true], ['vals', false], ['files', false]]),
        createValidateHandler(req => [
          validateOrReject(plainToInstance(Validators.MultiForm, req.body as any, transformerOptions), validatorOptions)
        ])
      ]
    },
    methodToHandler(controller3.post)
  )

  fastify.get(
    `${basePath}/texts`,
    {
      onRequest: hooks0.onRequest,
      preParsing: hooks0.preParsing,
      preValidation: callParserIfExistsQuery(parseNumberTypeQueryParams([['limit', true, false]]))
    },
    methodToHandler(controller4.get)
  )

  fastify.put(
    `${basePath}/texts`,
    {
      onRequest: hooks0.onRequest,
      preParsing: hooks0.preParsing
    },
    methodToHandler(controller4.put)
  )

  fastify.put(
    `${basePath}/texts/sample`,
    {
      onRequest: hooks0.onRequest,
      preParsing: hooks0.preParsing
    },
    methodToHandler(controller5.put)
  )

  fastify.get(
    `${basePath}/texts/:label`,
    {
      onRequest: hooks0.onRequest,
      preParsing: hooks0.preParsing
    },
    methodToHandler(controller6.get)
  )

  fastify.get(
    `${basePath}/users`,
    {
      onRequest: [...hooks0.onRequest, hooks2.onRequest],
      preParsing: hooks0.preParsing,
      preHandler: ctrlHooks1.preHandler
    } as RouteShorthandOptions,
    asyncMethodToHandler(controller7.get)
  )

  fastify.post(
    `${basePath}/users`,
    {
      onRequest: [...hooks0.onRequest, hooks2.onRequest],
      preParsing: hooks0.preParsing,
      preValidation: createValidateHandler(req => [
          validateOrReject(plainToInstance(Validators.UserInfo, req.body as any, transformerOptions), validatorOptions)
        ]),
      preHandler: ctrlHooks1.preHandler
    } as RouteShorthandOptions,
    methodToHandler(controller7.post)
  )

  fastify.get(
    `${basePath}/users/:userId`,
    {
      onRequest: [...hooks0.onRequest, hooks2.onRequest],
      preParsing: hooks0.preParsing,
      preValidation: createTypedParamsHandler(['userId'])
    } as RouteShorthandOptions,
    methodToHandler(controller8.get)
  )

  fastify.get(
    `${basePath}/users/:userId/:name`,
    {
      onRequest: [...hooks0.onRequest, hooks2.onRequest, hooks3.onRequest],
      preParsing: hooks0.preParsing,
      preValidation: createTypedParamsHandler(['userId'])
    } as RouteShorthandOptions,
    methodToHandler(controller9.get)
  )

  return fastify
}

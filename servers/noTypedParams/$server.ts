/* eslint-disable */
import { LowerHttpMethod, AspidaMethods, HttpMethod, HttpStatusOk, AspidaMethodParams } from 'aspida'
import { FastifyInstance, RouteHandlerMethod, preValidationHookHandler, FastifyRequest } from 'fastify'
import multipart, { FastifyMultipartOptions, Multipart } from 'fastify-multipart'
import { validateOrReject } from 'class-validator'
import * as Validators from './validators'
import hooksFn0 from './api/hooks'
import hooksFn1 from './api/users/hooks'
import controllerFn0, { hooks as ctrlHooksFn0 } from './api/controller'
import controllerFn1 from './api/empty/noEmpty/controller'
import controllerFn2 from './api/multiForm/controller'
import controllerFn3 from './api/texts/controller'
import controllerFn4 from './api/texts/sample/controller'
import controllerFn5, { hooks as ctrlHooksFn1 } from './api/users/controller'

export type FrourioOptions = {
  basePath?: string
  multipart?: FastifyMultipartOptions
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

type ServerValues = {
  params?: Record<string, any>
  user?: any
}

type BlobToFile<T extends AspidaMethodParams> = T['reqFormat'] extends FormData
  ? {
      [P in keyof T['reqBody']]: Required<T['reqBody']>[P] extends Blob
        ? Multipart
        : Required<T['reqBody']>[P] extends Blob[]
        ? Multipart[]
        : T['reqBody'][P]
    }
  : T['reqBody']

type RequestParams<T extends AspidaMethodParams> = {
  path: string
  method: HttpMethod
  query: T['query']
  body: BlobToFile<T>
  headers: T['reqHeaders']
}

export type ServerMethods<T extends AspidaMethods, U extends ServerValues> = {
  [K in keyof T]: (
    req: RequestParams<T[K]> & U
  ) => ServerResponse<T[K]> | Promise<ServerResponse<T[K]>>
}

const createValidateHandler = (validators: (req: FastifyRequest) => (Promise<void> | null)[]): preValidationHookHandler =>
  (req, reply) => Promise.all(validators(req)).catch(() => reply.code(400).send())

const methodToHandler = (
  methodCallback: ServerMethods<any, any>[LowerHttpMethod]
): RouteHandlerMethod => async (req, reply) => {
  const result = methodCallback({
    query: req.query,
    path: req.url,
    method: req.method as HttpMethod,
    body: req.body,
    headers: req.headers,
    params: req.params,
    user: (req as any).user
  })

  const { status, body, headers } = result instanceof Promise ? await result : result

  reply.code(status).headers(headers ?? {}).send(body)
}

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

export default (fastify: FastifyInstance, options: FrourioOptions = {}) => {
  const basePath = options.basePath ?? ''
  const hooks0 = hooksFn0(fastify)
  const hooks1 = hooksFn1(fastify)
  const ctrlHooks0 = ctrlHooksFn0(fastify)
  const ctrlHooks1 = ctrlHooksFn1(fastify)
  const controller0 = controllerFn0()
  const controller1 = controllerFn1()
  const controller2 = controllerFn2()
  const controller3 = controllerFn3()
  const controller4 = controllerFn4()
  const controller5 = controllerFn5()

  fastify.register(multipart, { attachFieldsToBody: true, limits: { fileSize: 1024 ** 3 }, ...options.multipart })

  fastify.get(
    `${basePath}/`,
    {
      onRequest: [hooks0.onRequest, ctrlHooks0.onRequest],
      preValidation: createValidateHandler(req => [
          Object.keys(req.query as any).length ? validateOrReject(Object.assign(new Validators.Query(), req.query as any)) : null
        ])
    },
    methodToHandler(controller0.get)
  )

  fastify.post(
    `${basePath}/`,
    {
      onRequest: [hooks0.onRequest, ctrlHooks0.onRequest],
      preValidation: [
        formatMultipartData([]),
        createValidateHandler(req => [
          validateOrReject(Object.assign(new Validators.Query(), req.query as any)),
          validateOrReject(Object.assign(new Validators.Body(), req.body as any))
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
          validateOrReject(Object.assign(new Validators.MultiForm(), req.body as any))
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
    },
    methodToHandler(controller5.get)
  )

  fastify.post(
    `${basePath}/users`,
    {
      onRequest: [hooks0.onRequest, hooks1.onRequest],
      preValidation: createValidateHandler(req => [
          validateOrReject(Object.assign(new Validators.UserInfo(), req.body as any))
        ]),
      preHandler: ctrlHooks1.preHandler
    },
    methodToHandler(controller5.post)
  )

  return fastify
}

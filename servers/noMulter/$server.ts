/* eslint-disable */
import { LowerHttpMethod, AspidaMethods, HttpStatusOk, AspidaMethodParams } from 'aspida'
import { FastifyInstance, RouteHandlerMethod, preValidationHookHandler, FastifyRequest } from 'fastify'
import { validateOrReject } from 'class-validator'
import * as Validators from './validators'
import hooksFn0 from './api/hooks'
import hooksFn1 from './api/users/hooks'
import controllerFn0, { hooks as ctrlHooksFn0 } from './api/controller'
import controllerFn1 from './api/empty/noEmpty/controller'
import controllerFn2 from './api/texts/controller'
import controllerFn3 from './api/texts/sample/controller'
import controllerFn4, { hooks as ctrlHooksFn1 } from './api/users/controller'
import controllerFn5 from './api/users/_userId@number/controller'

export type FrourioOptions = {
  basePath?: string
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

type RequestParams<T extends AspidaMethodParams> = {
  query: T['query']
  body: T['reqBody']
  headers: T['reqHeaders']
}

export type ServerMethods<T extends AspidaMethods, U extends ServerValues> = {
  [K in keyof T]: (
    req: RequestParams<T[K]> & U
  ) => ServerResponse<T[K]> | Promise<ServerResponse<T[K]>>
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
  (req, reply) => Promise.all(validators(req)).catch(() => reply.code(400).send())

const methodToHandler = (
  methodCallback: ServerMethods<any, any>[LowerHttpMethod]
): RouteHandlerMethod => (req, reply) => {
  const data = methodCallback(req as any) as any

  reply.code(data.status).headers(data.headers ?? {}).send(data.body)
}

const asyncMethodToHandler = (
  methodCallback: ServerMethods<any, any>[LowerHttpMethod]
): RouteHandlerMethod => async (req, reply) => {
  const data = await methodCallback(req as any)

  reply.code(data.status).headers(data.headers ?? {}).send(data.body)
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

  fastify.get(
    `${basePath}/`,
    {
      onRequest: [hooks0.onRequest, ctrlHooks0.onRequest],
      preValidation: createValidateHandler(req => [
          Object.keys(req.query as any).length ? validateOrReject(Object.assign(new Validators.Query(), req.query as any)) : null
        ])
    },
    asyncMethodToHandler(controller0.get)
  )

  fastify.post(
    `${basePath}/`,
    {
      onRequest: [hooks0.onRequest, ctrlHooks0.onRequest],
      preValidation: createValidateHandler(req => [
          validateOrReject(Object.assign(new Validators.Query(), req.query as any)),
          validateOrReject(Object.assign(new Validators.Body(), req.body as any))
        ])
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

  fastify.get(
    `${basePath}/texts`,
    {
      onRequest: hooks0.onRequest
    },
    methodToHandler(controller2.get)
  )

  fastify.put(
    `${basePath}/texts`,
    {
      onRequest: hooks0.onRequest
    },
    methodToHandler(controller2.put)
  )

  fastify.put(
    `${basePath}/texts/sample`,
    {
      onRequest: hooks0.onRequest
    },
    methodToHandler(controller3.put)
  )

  fastify.get(
    `${basePath}/users`,
    {
      onRequest: [hooks0.onRequest, hooks1.onRequest],
      preHandler: ctrlHooks1.preHandler
    },
    asyncMethodToHandler(controller4.get)
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
    methodToHandler(controller4.post)
  )

  fastify.get(
    `${basePath}/users/:userId`,
    {
      onRequest: [hooks0.onRequest, hooks1.onRequest],
      preValidation: createTypedParamsHandler(['userId'])
    },
    methodToHandler(controller5.get)
  )

  return fastify
}

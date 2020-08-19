/* eslint-disable */
import {
  LowerHttpMethod,
  AspidaMethods,
  HttpMethod,
  HttpStatusOk,
  AspidaMethodParams
} from 'aspida'
import { Deps } from 'velona'
import express, { Express, RequestHandler, Request } from 'express'
import { validateOrReject } from 'class-validator'

type Hooks = {
  onRequest?: RequestHandler | RequestHandler[]
  preParsing?: RequestHandler | RequestHandler[]
  preValidation?: RequestHandler | RequestHandler[]
  preHandler?: RequestHandler | RequestHandler[]
  onSend?: RequestHandler | RequestHandler[]
}

export function createHooks(hooks: () => Hooks): Hooks
export function createHooks<T extends Record<string, any>>(deps: T, cb: (deps: Deps<T>) => Hooks): Hooks & { inject: (d: Deps<T>) => Hooks }
export function createHooks<T extends Record<string, any>>(hooks: () => Hooks | T, cb?: (deps: Deps<T>) => Hooks) {
  return typeof hooks === 'function' ? hooks() : { ...cb!(hooks), inject: (d: Deps<T>) => cb!(d) }
}

import * as Types from './types'
import controller0, { hooks as ctrlHooks0 } from './api/controller'
import controller1 from './api/empty/noEmpty/controller'
import controller2 from './api/texts/controller'
import controller3 from './api/texts/sample/controller'
import controller4, { hooks as ctrlHooks1 } from './api/users/controller'
import controller5 from './api/users/_userId@number/controller'
import hooks0 from './api/hooks'
import hooks1 from './api/users/hooks'

export type FrourioOptions = {
  basePath?: string
}

type HttpStatusNoOk =
  | 301
  | 302
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 409
  | 500
  | 501
  | 502
  | 503
  | 504
  | 505

type PartiallyPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type BaseResponse<T, U, V> = {
  status: V extends number ? V : HttpStatusOk
  body: T
  headers: U
}

type ServerResponse<K extends AspidaMethodParams> =
  | (K['resBody'] extends {} | null
      ? K['resHeaders'] extends {}
        ? BaseResponse<K['resBody'], K['resHeaders'], K['status']>
        : PartiallyPartial<
            BaseResponse<
              K['resBody'],
              K['resHeaders'] extends {} | undefined ? K['resHeaders'] : undefined,
              K['status']
            >,
            'headers'
          >
      : K['resHeaders'] extends {}
      ? PartiallyPartial<
          BaseResponse<
            K['resBody'] extends {} | null | undefined ? K['resBody'] : undefined,
            K['resHeaders'],
            K['status']
          >,
          'body'
        >
      : PartiallyPartial<
          BaseResponse<
            K['resBody'] extends {} | null | undefined ? K['resBody'] : undefined,
            K['resHeaders'] extends {} | undefined ? K['resHeaders'] : undefined,
            K['status']
          >,
          'body' | 'headers'
        >)
  | PartiallyPartial<BaseResponse<any, any, HttpStatusNoOk>, 'body' | 'headers'>

type ServerValues = {
  params?: Record<string, any>
  user?: any
}

type RequestParams<T extends AspidaMethodParams> = {
  path: string
  method: HttpMethod
  query: T['query']
  body: T['reqBody']
  headers: T['reqHeaders']
}

export type ServerMethods<T extends AspidaMethods, U extends ServerValues> = {
  [K in keyof T]: (
    req: RequestParams<T[K]> & U
  ) => ServerResponse<T[K]> | Promise<ServerResponse<T[K]>>
}

const parseJSONBoby: RequestHandler = (req, res, next) => {
  express.json()(req, res, err => {
    if (err) return res.sendStatus(400)

    next()
  })
}

const createTypedParamsHandler = (numberTypeParams: string[]): RequestHandler => (
  req,
  res,
  next
) => {
  const typedParams: Record<string, string | number> = { ...req.params }

  for (const key of numberTypeParams) {
    const val = Number(typedParams[key])
    if (isNaN(val)) {
      res.sendStatus(400)
      return
    }

    typedParams[key] = val
  }

  ;(req as any).typedParams = typedParams
  next()
}

const createValidateHandler = (validators: (req: Request) => (Promise<void> | null)[]): RequestHandler =>
  (req, res, next) => Promise.all(validators(req)).then(() => next()).catch(() => res.sendStatus(400))

const methodsToHandler = (
  methodCallback: ServerMethods<any, any>[LowerHttpMethod]
): RequestHandler => async (req, res) => {
  try {
    const result = methodCallback({
      query: req.query,
      path: req.path,
      method: req.method as HttpMethod,
      body: req.body,
      headers: req.headers,
      params: (req as any).typedParams,
      user: (req as any).user
    })

    const { status, body, headers } = result instanceof Promise ? await result : result

    for (const key in headers) {
      res.setHeader(key, headers[key])
    }

    res.status(status).send(body)
  } catch (e) {
    res.sendStatus(500)
  }
}

const margeHook = (...args: (RequestHandler | RequestHandler[] | undefined)[]) =>
  args.filter(Boolean).flatMap(handler => Array.isArray(handler) ? handler : [handler]) as RequestHandler[]

export default (app: Express, options: FrourioOptions = {}) => {
  const basePath = options.basePath ?? ''

  app.get(`${basePath}/`, [
    ...margeHook(hooks0.onRequest, ctrlHooks0.onRequest),
    ...margeHook(hooks0.preValidation, ctrlHooks0.preValidation),
    createValidateHandler(req => [
      Object.keys(req.query).length ? validateOrReject(Object.assign(new Types.ValidQuery(), req.query)) : null
    ]),
    ...margeHook(hooks0.preHandler, ctrlHooks0.preHandler),
    methodsToHandler(controller0.get),
    ...margeHook(hooks0.onSend, ctrlHooks0.onSend)
  ])

  app.post(`${basePath}/`, [
    ...margeHook(hooks0.onRequest, ctrlHooks0.onRequest),
    ...margeHook(hooks0.preParsing, ctrlHooks0.preParsing),
    parseJSONBoby,
    ...margeHook(hooks0.preValidation, ctrlHooks0.preValidation),
    createValidateHandler(req => [
      validateOrReject(Object.assign(new Types.ValidQuery(), req.query)),
      validateOrReject(Object.assign(new Types.ValidBody(), req.body))
    ]),
    ...margeHook(hooks0.preHandler, ctrlHooks0.preHandler),
    methodsToHandler(controller0.post),
    ...margeHook(hooks0.onSend, ctrlHooks0.onSend)
  ])

  app.get(`${basePath}/empty/noEmpty`, [
    ...margeHook(hooks0.onRequest),
    ...margeHook(hooks0.preHandler),
    methodsToHandler(controller1.get),
    ...margeHook(hooks0.onSend)
  ])

  app.get(`${basePath}/texts`, [
    ...margeHook(hooks0.onRequest),
    ...margeHook(hooks0.preHandler),
    methodsToHandler(controller2.get),
    ...margeHook(hooks0.onSend)
  ])

  app.put(`${basePath}/texts`, [
    ...margeHook(hooks0.onRequest),
    ...margeHook(hooks0.preHandler),
    methodsToHandler(controller2.put),
    ...margeHook(hooks0.onSend)
  ])

  app.put(`${basePath}/texts/sample`, [
    ...margeHook(hooks0.onRequest),
    ...margeHook(hooks0.preParsing),
    parseJSONBoby,
    ...margeHook(hooks0.preHandler),
    methodsToHandler(controller3.put),
    ...margeHook(hooks0.onSend)
  ])

  app.get(`${basePath}/users`, [
    ...margeHook(hooks0.onRequest, hooks1.onRequest, ctrlHooks1.onRequest),
    ...margeHook(hooks0.preHandler, hooks1.preHandler, ctrlHooks1.preHandler),
    methodsToHandler(controller4.get),
    ...margeHook(hooks0.onSend, hooks1.onSend, ctrlHooks1.onSend)
  ])

  app.post(`${basePath}/users`, [
    ...margeHook(hooks0.onRequest, hooks1.onRequest, ctrlHooks1.onRequest),
    ...margeHook(hooks0.preParsing, hooks1.preParsing, ctrlHooks1.preParsing),
    parseJSONBoby,
    ...margeHook(hooks0.preValidation, hooks1.preValidation, ctrlHooks1.preValidation),
    createValidateHandler(req => [
      validateOrReject(Object.assign(new Types.ValidUserInfo(), req.body))
    ]),
    ...margeHook(hooks0.preHandler, hooks1.preHandler, ctrlHooks1.preHandler),
    methodsToHandler(controller4.post),
    ...margeHook(hooks0.onSend, hooks1.onSend, ctrlHooks1.onSend)
  ])

  app.get(`${basePath}/users/:userId`, [
    ...margeHook(hooks0.onRequest, hooks1.onRequest),
    ...margeHook(hooks0.preValidation, hooks1.preValidation),
    createTypedParamsHandler(['userId']),
    ...margeHook(hooks0.preHandler, hooks1.preHandler),
    methodsToHandler(controller5.get),
    ...margeHook(hooks0.onSend, hooks1.onSend)
  ])

  return app
}

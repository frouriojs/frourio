/* eslint-disable */
import { LowerHttpMethod, AspidaMethods, HttpMethod, HttpStatusOk, AspidaMethodParams } from 'aspida'
import express, { Express, RequestHandler, Request } from 'express'
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

const createTypedParamsHandler = (numberTypeParams: string[]): RequestHandler => (req, res, next) => {
  const params: Record<string, string | number> = req.params

  for (const key of numberTypeParams) {
    const val = Number(params[key])

    if (isNaN(val)) return res.sendStatus(400)

    params[key] = val
  }

  next()
}

const createValidateHandler = (validators: (req: Request) => (Promise<void> | null)[]): RequestHandler =>
  (req, res, next) => Promise.all(validators(req)).then(() => next()).catch(() => res.sendStatus(400))

const methodToHandler = (
  methodCallback: ServerMethods<any, any>[LowerHttpMethod]
): RequestHandler => async (req, res, next) => {
  try {
    const result = methodCallback({
      query: req.query,
      path: req.path,
      method: req.method as HttpMethod,
      body: req.body,
      headers: req.headers,
      params: req.params,
      user: (req as any).user
    })

    const { status, body, headers } = result instanceof Promise ? await result : result

    for (const key in headers) {
      res.setHeader(key, headers[key])
    }

    res.status(status).send(body)
  } catch (e) {
    next(e)
  }
}

export default (app: Express, options: FrourioOptions = {}) => {
  const basePath = options.basePath ?? ''
  const hooks0 = hooksFn0(app)
  const hooks1 = hooksFn1(app)
  const ctrlHooks0 = ctrlHooksFn0(app)
  const ctrlHooks1 = ctrlHooksFn1(app)
  const controller0 = controllerFn0()
  const controller1 = controllerFn1()
  const controller2 = controllerFn2()
  const controller3 = controllerFn3()
  const controller4 = controllerFn4()
  const controller5 = controllerFn5()

  app.get(`${basePath}/`, [
    hooks0.onRequest,
    ctrlHooks0.onRequest,
    createValidateHandler(req => [
      Object.keys(req.query).length ? validateOrReject(Object.assign(new Validators.Query(), req.query)) : null
    ]),
    methodToHandler(controller0.get)
  ])

  app.post(`${basePath}/`, [
    hooks0.onRequest,
    ctrlHooks0.onRequest,
    parseJSONBoby,
    createValidateHandler(req => [
      validateOrReject(Object.assign(new Validators.Query(), req.query)),
      validateOrReject(Object.assign(new Validators.Body(), req.body))
    ]),
    methodToHandler(controller0.post)
  ])

  app.get(`${basePath}/empty/noEmpty`, [
    hooks0.onRequest,
    methodToHandler(controller1.get)
  ])

  app.get(`${basePath}/texts`, [
    hooks0.onRequest,
    methodToHandler(controller2.get)
  ])

  app.put(`${basePath}/texts`, [
    hooks0.onRequest,
    methodToHandler(controller2.put)
  ])

  app.put(`${basePath}/texts/sample`, [
    hooks0.onRequest,
    parseJSONBoby,
    methodToHandler(controller3.put)
  ])

  app.get(`${basePath}/users`, [
    hooks0.onRequest,
    hooks1.onRequest,
    ...ctrlHooks1.preHandler,
    methodToHandler(controller4.get)
  ])

  app.post(`${basePath}/users`, [
    hooks0.onRequest,
    hooks1.onRequest,
    parseJSONBoby,
    createValidateHandler(req => [
      validateOrReject(Object.assign(new Validators.UserInfo(), req.body))
    ]),
    ...ctrlHooks1.preHandler,
    methodToHandler(controller4.post)
  ])

  app.get(`${basePath}/users/:userId`, [
    hooks0.onRequest,
    hooks1.onRequest,
    createTypedParamsHandler(['userId']),
    methodToHandler(controller5.get)
  ])

  return app
}

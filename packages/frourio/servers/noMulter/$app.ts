/* eslint-disable */
import {
  LowerHttpMethod,
  AspidaMethods,
  HttpMethod,
  HttpStatusOk,
  AspidaMethodParams
} from 'aspida'
import express, { Express, RequestHandler, Request } from 'express'
import { validateOrReject } from 'class-validator'

export const createMiddleware = <T extends RequestHandler | RequestHandler[]>(handler: T): T extends RequestHandler[] ? T : [T] => (Array.isArray(handler) ? handler : [handler]) as any

import * as Types from './types'
import controller0, { middleware as ctrlMiddleware0 } from './api/@controller'
import controller1 from './api/empty/noEmpty/@controller'
import controller2 from './api/texts/@controller'
import controller3 from './api/texts/sample/@controller'
import controller4, { middleware as ctrlMiddleware1 } from './api/users/@controller'
import controller5 from './api/users/_userId@number/@controller'
import middleware0 from './api/@middleware'
import middleware1 from './api/users/@middleware'

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

export default (app: Express, options: FrourioOptions = {}) => {
  const basePath = options.basePath ?? ''

  app.get(`${basePath}/`, [
    createValidateHandler(req => [
      Object.keys(req.query).length ? validateOrReject(Object.assign(new Types.ValidQuery(), req.query)) : null
    ]),
    ...middleware0,
    ...ctrlMiddleware0,
    methodsToHandler(controller0.get)
  ])

  app.post(`${basePath}/`, [
    parseJSONBoby,
    createValidateHandler(req => [
      validateOrReject(Object.assign(new Types.ValidQuery(), req.query)),
      validateOrReject(Object.assign(new Types.ValidBody(), req.body))
    ]),
    ...middleware0,
    ...ctrlMiddleware0,
    methodsToHandler(controller0.post)
  ])

  app.get(`${basePath}/empty/noEmpty`, [
    ...middleware0,
    methodsToHandler(controller1.get)
  ])

  app.get(`${basePath}/texts`, [
    ...middleware0,
    methodsToHandler(controller2.get)
  ])

  app.put(`${basePath}/texts`, [
    ...middleware0,
    methodsToHandler(controller2.put)
  ])

  app.put(`${basePath}/texts/sample`, [
    parseJSONBoby,
    ...middleware0,
    methodsToHandler(controller3.put)
  ])

  app.get(`${basePath}/users`, [
    ...middleware0,
    ...middleware1,
    ...ctrlMiddleware1,
    methodsToHandler(controller4.get)
  ])

  app.post(`${basePath}/users`, [
    parseJSONBoby,
    createValidateHandler(req => [
      validateOrReject(Object.assign(new Types.ValidUserInfo(), req.body))
    ]),
    ...middleware0,
    ...middleware1,
    ...ctrlMiddleware1,
    methodsToHandler(controller4.post)
  ])

  app.get(`${basePath}/users/:userId`, [
    createTypedParamsHandler(['userId']),
    ...middleware0,
    ...middleware1,
    methodsToHandler(controller5.get)
  ])

  return app
}

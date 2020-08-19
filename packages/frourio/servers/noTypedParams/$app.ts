/* eslint-disable */
import path from 'path'
import {
  $arrayTypeKeysName,
  LowerHttpMethod,
  AspidaMethods,
  HttpMethod,
  HttpStatusOk,
  AspidaMethodParams
} from 'aspida'
import { Deps } from 'velona'
import express, { Express, RequestHandler, Request } from 'express'
import multer, { Options } from 'multer'
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
import controller2 from './api/multiForm/controller'
import controller3 from './api/texts/controller'
import controller4 from './api/texts/sample/controller'
import controller5, { hooks as ctrlHooks1 } from './api/users/controller'
import hooks0 from './api/hooks'
import hooks1 from './api/users/hooks'

export type FrourioOptions = {
  basePath?: string
  multer?: Options
}

export type MulterFile = Express.Multer.File

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

type BlobToFile<T extends AspidaMethodParams> = T['reqFormat'] extends FormData
  ? {
      [P in keyof T['reqBody']]: Required<T['reqBody']>[P] extends Blob
        ? MulterFile
        : Required<T['reqBody']>[P] extends Blob[]
        ? MulterFile[]
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

const parseJSONBoby: RequestHandler = (req, res, next) => {
  express.json()(req, res, err => {
    if (err) return res.sendStatus(400)

    next()
  })
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

const formatMulterData: RequestHandler = ({ body, files }, _res, next) => {
  if (body[$arrayTypeKeysName]) {
    const arrayTypeKeys: string[] = body[$arrayTypeKeysName].split(',')

    for (const key of arrayTypeKeys) {
      if (body[key] === undefined) body[key] = []
      else if (!Array.isArray(body[key])) {
        body[key] = [body[key]]
      }
    }

    for (const file of files as MulterFile[]) {
      if (Array.isArray(body[file.fieldname])) {
        body[file.fieldname].push(file)
      } else {
        body[file.fieldname] = file
      }
    }

    delete body[$arrayTypeKeysName]
  } else {
    for (const file of files as MulterFile[]) {
      if (Array.isArray(body[file.fieldname])) {
        body[file.fieldname].push(file)
      } else {
        body[file.fieldname] =
          body[file.fieldname] === undefined ? file : [body[file.fieldname], file]
      }
    }
  }

  next()
}

const margeHook = (...args: (RequestHandler | RequestHandler[] | undefined)[]) =>
  args.filter(Boolean).flatMap(handler => Array.isArray(handler) ? handler : [handler]) as RequestHandler[]

export default (app: Express, options: FrourioOptions = {}) => {
  const basePath = options.basePath ?? ''
  const uploader = multer(
      options.multer ?? { dest: path.join(__dirname, '.upload'), limits: { fileSize: 1024 ** 3 } }
  ).any()

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
    uploader,
    formatMulterData,
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

  app.post(`${basePath}/multiForm`, [
    ...margeHook(hooks0.onRequest),
    ...margeHook(hooks0.preParsing),
    uploader,
    formatMulterData,
    ...margeHook(hooks0.preValidation),
    createValidateHandler(req => [
      validateOrReject(Object.assign(new Types.ValidMultiForm(), req.body))
    ]),
    ...margeHook(hooks0.preHandler),
    methodsToHandler(controller2.post),
    ...margeHook(hooks0.onSend)
  ])

  app.get(`${basePath}/texts`, [
    ...margeHook(hooks0.onRequest),
    ...margeHook(hooks0.preHandler),
    methodsToHandler(controller3.get),
    ...margeHook(hooks0.onSend)
  ])

  app.put(`${basePath}/texts`, [
    ...margeHook(hooks0.onRequest),
    ...margeHook(hooks0.preHandler),
    methodsToHandler(controller3.put),
    ...margeHook(hooks0.onSend)
  ])

  app.put(`${basePath}/texts/sample`, [
    ...margeHook(hooks0.onRequest),
    ...margeHook(hooks0.preParsing),
    parseJSONBoby,
    ...margeHook(hooks0.preHandler),
    methodsToHandler(controller4.put),
    ...margeHook(hooks0.onSend)
  ])

  app.get(`${basePath}/users`, [
    ...margeHook(hooks0.onRequest, hooks1.onRequest, ctrlHooks1.onRequest),
    ...margeHook(hooks0.preHandler, hooks1.preHandler, ctrlHooks1.preHandler),
    methodsToHandler(controller5.get),
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
    methodsToHandler(controller5.post),
    ...margeHook(hooks0.onSend, hooks1.onSend, ctrlHooks1.onSend)
  ])

  return app
}

/* eslint-disable */
import path from 'path'
import { LowerHttpMethod, AspidaMethods, HttpMethod, HttpStatusOk, AspidaMethodParams } from 'aspida'
import express, { Express, RequestHandler, Request } from 'express'
import multer, { Options } from 'multer'
import { validateOrReject } from 'class-validator'
import * as Validators from './validators'
import hooksFn0 from './api/hooks'
import hooksFn1 from './api/users/hooks'
import controllerFn0, { hooks as ctrlHooksFn0 } from './api/controller'
import controllerFn1 from './api/500/controller'
import controllerFn2 from './api/empty/noEmpty/controller'
import controllerFn3 from './api/multiForm/controller'
import controllerFn4 from './api/texts/controller'
import controllerFn5 from './api/texts/sample/controller'
import controllerFn6 from './api/texts/_label@string/controller'
import controllerFn7, { hooks as ctrlHooksFn1 } from './api/users/controller'
import controllerFn8 from './api/users/_userId@number/controller'
import controllerFn9 from './api/users/_userId@number/_name/controller'

export type FrourioOptions = {
  basePath?: string
  multer?: Options
}

export type MulterFile = Express.Multer.File

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

const parseNumberTypeQueryParams = (numberTypeParamsFn: (query: Request['query']) => ([string, boolean, boolean][])): RequestHandler => ({ query }, res, next) => {
  const numberTypeParams = numberTypeParamsFn(query)

  for (const [key, isOptional, isArray] of numberTypeParams) {
    const param = query[key]

    if (isArray) {
      if (!isOptional && param === undefined) {
        query[key] = []
      } else if (!isOptional || param !== undefined) {
        if (!Array.isArray(param)) return res.sendStatus(400)

        const vals = (param as string[]).map(Number)

        if (vals.some(isNaN)) return res.sendStatus(400)

        query[key] = vals as any
      }
    } else if (!isOptional || param !== undefined) {
      const val = Number(param)

      if (isNaN(val)) return res.sendStatus(400)

      query[key] = val as any
    }
  }

  next()
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

const formatMulterData = (arrayTypeKeys: [string, boolean][]): RequestHandler => ({ body, files }, _res, next) => {
  for (const [key] of arrayTypeKeys) {
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

  for (const [key, isOptional] of arrayTypeKeys) {
    if (!body[key].length && isOptional) delete body[key]
  }

  next()
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
  const controller6 = controllerFn6()
  const controller7 = controllerFn7()
  const controller8 = controllerFn8()
  const controller9 = controllerFn9()
  const uploader = multer({ dest: path.join(__dirname, '.upload'), limits: { fileSize: 1024 ** 3 }, ...options.multer }).any()

  app.get(`${basePath}/`, [
    ...hooks0.onRequest,
    ctrlHooks0.onRequest,
    hooks0.preParsing,
    parseNumberTypeQueryParams(query => !Object.keys(query).length ? [] : [['requiredNum', false, false], ['optionalNum', true, false], ['optionalNumArr', true, true], ['emptyNum', true, false], ['requiredNumArr', false, true]]),
    createValidateHandler(req => [
      Object.keys(req.query).length ? validateOrReject(Object.assign(new Validators.Query(), req.query)) : null
    ]),
    methodToHandler(controller0.get)
  ])

  app.post(`${basePath}/`, [
    ...hooks0.onRequest,
    ctrlHooks0.onRequest,
    hooks0.preParsing,
    parseNumberTypeQueryParams(() => [['requiredNum', false, false], ['optionalNum', true, false], ['optionalNumArr', true, true], ['emptyNum', true, false], ['requiredNumArr', false, true]]),
    uploader,
    formatMulterData([]),
    createValidateHandler(req => [
      validateOrReject(Object.assign(new Validators.Query(), req.query)),
      validateOrReject(Object.assign(new Validators.Body(), req.body))
    ]),
    methodToHandler(controller0.post)
  ])

  app.get(`${basePath}/500`, [
    ...hooks0.onRequest,
    hooks0.preParsing,
    methodToHandler(controller1.get)
  ])

  app.get(`${basePath}/empty/noEmpty`, [
    ...hooks0.onRequest,
    hooks0.preParsing,
    methodToHandler(controller2.get)
  ])

  app.post(`${basePath}/multiForm`, [
    ...hooks0.onRequest,
    hooks0.preParsing,
    uploader,
    formatMulterData([['requiredArr', false], ['optionalArr', true], ['empty', true], ['vals', false], ['files', false]]),
    createValidateHandler(req => [
      validateOrReject(Object.assign(new Validators.MultiForm(), req.body))
    ]),
    methodToHandler(controller3.post)
  ])

  app.get(`${basePath}/texts`, [
    ...hooks0.onRequest,
    hooks0.preParsing,
    parseNumberTypeQueryParams(query => !Object.keys(query).length ? [] : [['limit', true, false]]),
    methodToHandler(controller4.get)
  ])

  app.put(`${basePath}/texts`, [
    ...hooks0.onRequest,
    hooks0.preParsing,
    methodToHandler(controller4.put)
  ])

  app.put(`${basePath}/texts/sample`, [
    ...hooks0.onRequest,
    hooks0.preParsing,
    parseJSONBoby,
    methodToHandler(controller5.put)
  ])

  app.get(`${basePath}/texts/:label`, [
    ...hooks0.onRequest,
    hooks0.preParsing,
    methodToHandler(controller6.get)
  ])

  app.get(`${basePath}/users`, [
    ...hooks0.onRequest,
    hooks1.onRequest,
    hooks0.preParsing,
    ...ctrlHooks1.preHandler,
    methodToHandler(controller7.get)
  ])

  app.post(`${basePath}/users`, [
    ...hooks0.onRequest,
    hooks1.onRequest,
    hooks0.preParsing,
    parseJSONBoby,
    createValidateHandler(req => [
      validateOrReject(Object.assign(new Validators.UserInfo(), req.body))
    ]),
    ...ctrlHooks1.preHandler,
    methodToHandler(controller7.post)
  ])

  app.get(`${basePath}/users/:userId`, [
    ...hooks0.onRequest,
    hooks1.onRequest,
    hooks0.preParsing,
    createTypedParamsHandler(['userId']),
    methodToHandler(controller8.get)
  ])

  app.get(`${basePath}/users/:userId/:name`, [
    ...hooks0.onRequest,
    hooks1.onRequest,
    hooks0.preParsing,
    createTypedParamsHandler(['userId']),
    methodToHandler(controller9.get)
  ])

  return app
}

/* eslint-disable */
import 'reflect-metadata'
import fs from 'fs'
import path from 'path'
import {
  LowerHttpMethod,
  AspidaMethods,
  HttpMethod,
  HttpStatusOk,
  AspidaMethodParams,
  $arrayTypeKeysName
} from 'aspida'
import fastify, { onRequestHookHandler } from 'fastify'
import helmet, { FastifyHelmetOptions } from 'fastify-helmet'
import cors, { FastifyCorsOptions } from 'fastify-cors'
import staticPlugin from 'fastify-static'
import multipart, { FastifyMultipartOptions } from 'fastify-multipart'
import pump from 'pump'
import { createConnection, ConnectionOptions } from 'typeorm'
import { validateOrReject } from 'class-validator'

export const createMiddleware = <T extends onRequestHookHandler | onRequestHookHandler[]>(handler: T): T extends onRequestHookHandler[] ? T : [T] => (Array.isArray(handler) ? handler : [handler]) as any

import { Task as Entity0 } from './entity/Task'
import { TaskSubscriber as Subscriber0 } from './subscriber/TaskSubscriber'
import * as Types from './types'
import controller0, { middleware as ctrlMiddleware0 } from './api/@controller'
import controller1 from './api/multiForm/@controller'
import controller2 from './api/texts/@controller'
import controller3 from './api/texts/sample/@controller'
import controller4, { middleware as ctrlMiddleware1 } from './api/users/@controller'
import controller5 from './api/users/_userId@number/@controller'
import middleware0 from './api/@middleware'
import middleware1 from './api/users/@middleware'

export const controllers = [
  {
    path: '/',
    validator: {
      get: {
        query: { required: false, Class: Types.ValidQuery }
      },
      post: {
        query: { required: true, Class: Types.ValidQuery },
        body: { required: true, Class: Types.ValidBody }
      }
    },
    uploader: ['post'],
    controller: controller0,
    middleware: [...middleware0, ...ctrlMiddleware0]
  },
  {
    path: '/multiForm',
    validator: {
      post: {
        body: { required: true, Class: Types.ValidMultiForm }
      }
    },
    uploader: ['post'],
    controller: controller1,
    middleware: middleware0
  },
  {
    path: '/texts',
    controller: controller2,
    middleware: middleware0
  },
  {
    path: '/texts/sample',
    controller: controller3,
    middleware: middleware0
  },
  {
    path: '/users',
    validator: {
      post: {
        body: { required: true, Class: Types.ValidUserInfo }
      }
    },
    controller: controller4,
    middleware: [...middleware0, ...middleware1, ...ctrlMiddleware1]
  },
  {
    path: '/users/:userId',
    numberTypeParams: ['userId'],
    controller: controller5,
    middleware: [...middleware0, ...middleware1]
  }
]

export type File = {
  field: string
  filename: string
  encoding: string
  mimetype: string
}

export type Config = {
  port: number
  basePath?: string
  helmet?: boolean | FastifyHelmetOptions
  cors?: boolean | FastifyCorsOptions
  typeorm?: ConnectionOptions
  multipart?: FastifyMultipartOptions
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

type BlobToFile<T extends AspidaMethodParams> = T['reqFormat'] extends FormData
  ? {
      [P in keyof T['reqBody']]: Required<T['reqBody']>[P] extends Blob
        ? File
        : Required<T['reqBody']>[P] extends Blob[]
        ? File[]
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

type Validator = {
  required: boolean
  Class: any
}

type Validators = {
  query?: Validator
  body?: Validator
  headers?: Validator
}

const createValidateHandler = (validator: Validators): onRequestHookHandler => (
  req,
  res,
  next
) =>
  Promise.all([
    validator.query &&
      (Object.keys(req.query).length || validator.query.required ? true : undefined) &&
      validateOrReject(Object.assign(new validator.query.Class(), req.query)),
    validator.headers &&
      (Object.keys(req.headers).length || validator.headers.required ? true : undefined) &&
      validateOrReject(Object.assign(new validator.headers.Class(), req.headers)),
    validator.body &&
      (Object.keys(req.body).length || validator.body.required ? true : undefined) &&
      validateOrReject(Object.assign(new validator.body.Class(), req.body))
  ])
    .then(() => next())
    .catch(() => res.status(400).send())

const createTypedParamsHandler = (numberTypeParams: string[]): onRequestHookHandler => (
  req,
  res,
  next
) => {
  const typedParams: Record<string, string | number> = { ...req.params as any }

  for (const key of numberTypeParams) {
    const val = Number(typedParams[key])
    if (isNaN(val)) {
      res.status(400).send()
      return
    }

    typedParams[key] = val
  }

  ;(req as any).typedParams = typedParams
  next()
}

const methodsToHandler = (
  methodCallback: ServerMethods<any, any>[LowerHttpMethod]
): onRequestHookHandler => async (req, res) => {
  try {
    const result = methodCallback({
      query: req.query,
      path: req.url,
      method: req.method as HttpMethod,
      body: req.body,
      headers: req.headers,
      params: (req as any).typedParams,
      user: (req as any).user
    })

    const { status, body, headers } = result instanceof Promise ? await result : result

    for (const key in headers) {
      res.header(key, headers[key])
    }

    res.status(status).send(body)
  } catch (e) {
    res.status(500).send()
  }
}

export const entities = [Entity0]
export const migrations = []
export const subscribers = [Subscriber0]
export const run = async (config: Config) => {
  const app = fastify()

  if (config.helmet) app.register(helmet, config.helmet === true ? {} : config.helmet)
  if (config.cors) app.register(cors, config.cors === true ? {} : config.cors)

  const basePath = config.basePath ? `/${config.basePath}`.replace('//', '/') : ''
  let initUploader = false
  const uploader:onRequestHookHandler = (req, res, done) => {
    if (req.isMultipart()) return done()

    const arrayTypeKeys = req.body[$arrayTypeKeysName] ? req.body[$arrayTypeKeysName].split(',') : null

    if (arrayTypeKeys) {
      for (const key of arrayTypeKeys) {
        req.body[key] = []
      }

      delete req.body[$arrayTypeKeysName]
    }

    req.multipart((field, file, filename, encoding, mimetype) => {
      pump(file, fs.createWriteStream(path.join(__dirname, '.upload', filename)))

      const fileData: File = {
        field,
        filename,
        encoding,
        mimetype
      }

      if (arrayTypeKeys) {
        if (arrayTypeKeys.includes(field)) {
          req.body[field].push(fileData)
        } else {
          req.body[field] = fileData
        }
      } else {
        if (Array.isArray(req.body[field])) {
          req.body[field].push(file)
        } else if (req.body[field])  {
          req.body[field] = [req.body[field], fileData]
        } else {
          req.body[field] = fileData
        }
      }
    }, done)
  }

  for (const ctrl of controllers) {
    const typedParamsHandler = ctrl.numberTypeParams && createTypedParamsHandler(ctrl.numberTypeParams)

    for (const method in ctrl.controller) {
      const handlers: onRequestHookHandler[] = []
      if (ctrl.uploader?.includes(method)) {
        if (!initUploader) {
          initUploader = true
          app.register(multipart, config.multipart ?? { limits: { fileSize: 1024 ** 3 } })
        }
        handlers.push(uploader)
      }
      if (ctrl.validator?.[method as LowerHttpMethod]) handlers.push(createValidateHandler(ctrl.validator[method as LowerHttpMethod]))
      if (typedParamsHandler) handlers.push(typedParamsHandler)
      if (ctrl.middleware) handlers.push(...ctrl.middleware)
      handlers.push(methodsToHandler(ctrl.controller[method]))

      app[method](`${basePath}${ctrl.path}`, handlers)
    }
  }

  app.register(staticPlugin, {
    root: path.join(__dirname, 'public'),
    prefix: basePath,
    prefixAvoidTrailingSlash: !basePath.endsWith('/')
  })

  const connection = config.typeorm ? await createConnection({
    entities,
    migrations,
    subscribers,
    ...config.typeorm
  }) : null

  await app.listen(config.port)
  console.log(`Frourio is running on http://localhost:${config.port}`)
  return { app, server: app.server, connection }
}

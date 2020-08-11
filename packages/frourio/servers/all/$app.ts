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
import express, { RequestHandler, Request } from 'express'
import { FastifyInstance } from 'fastify'
import multer, { Options } from 'multer'
import { validateOrReject } from 'class-validator'

export const createMiddleware = <T extends RequestHandler | RequestHandler[]>(handler: T): T extends RequestHandler[] ? T : [T] => (Array.isArray(handler) ? handler : [handler]) as any

import { Task as Entity0 } from './entity/Task'
import { TaskSubscriber as Subscriber0 } from './subscriber/TaskSubscriber'
import * as Types from './types'
import controller0, { middleware as ctrlMiddleware0 } from './api/@controller'
import controller1 from './api/empty/noEmpty/@controller'
import controller2 from './api/multiForm/@controller'
import controller3 from './api/texts/@controller'
import controller4 from './api/texts/sample/@controller'
import controller5, { middleware as ctrlMiddleware1 } from './api/users/@controller'
import controller6 from './api/users/_userId@number/@controller'
import middleware0 from './api/@middleware'
import middleware1 from './api/users/@middleware'

export type Config = {
  port: number
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

export const controllers = (config: Pick<Config, 'multer'>): {
  path: string
  methods: {
    name: LowerHttpMethod
    handlers: RequestHandler[]
  }[]
}[] => {
  const uploader = multer(
    config.multer ?? { dest: path.join(__dirname, '.upload'), limits: { fileSize: 1024 ** 3 } }
  ).any()

  return [
    {
      path: '/',
      methods: [
        {
          name: 'get',
          handlers: [
            createValidateHandler(req => [
              Object.keys(req.query).length ? validateOrReject(Object.assign(new Types.ValidQuery(), req.query)) : null
            ]),
            ...middleware0,
            ...ctrlMiddleware0,
            methodsToHandler(controller0.get)
          ]
        },
        {
          name: 'post',
          handlers: [
            uploader,
            formatMulterData,
            createValidateHandler(req => [
              validateOrReject(Object.assign(new Types.ValidQuery(), req.query)),
              validateOrReject(Object.assign(new Types.ValidBody(), req.body))
            ]),
            ...middleware0,
            ...ctrlMiddleware0,
            methodsToHandler(controller0.post)
          ]
        }
      ]
    },
    {
      path: '/empty/noEmpty',
      methods: [
        {
          name: 'get',
          handlers: [
            ...middleware0,
            methodsToHandler(controller1.get)
          ]
        }
      ]
    },
    {
      path: '/multiForm',
      methods: [
        {
          name: 'post',
          handlers: [
            uploader,
            formatMulterData,
            createValidateHandler(req => [
              validateOrReject(Object.assign(new Types.ValidMultiForm(), req.body))
            ]),
            ...middleware0,
            methodsToHandler(controller2.post)
          ]
        }
      ]
    },
    {
      path: '/texts',
      methods: [
        {
          name: 'get',
          handlers: [
            ...middleware0,
            methodsToHandler(controller3.get)
          ]
        },
        {
          name: 'put',
          handlers: [
            ...middleware0,
            methodsToHandler(controller3.put)
          ]
        }
      ]
    },
    {
      path: '/texts/sample',
      methods: [
        {
          name: 'put',
          handlers: [
            ...middleware0,
            methodsToHandler(controller4.put)
          ]
        }
      ]
    },
    {
      path: '/users',
      methods: [
        {
          name: 'get',
          handlers: [
            ...middleware0,
            ...middleware1,
            ...ctrlMiddleware1,
            methodsToHandler(controller5.get)
          ]
        },
        {
          name: 'post',
          handlers: [
            createValidateHandler(req => [
              validateOrReject(Object.assign(new Types.ValidUserInfo(), req.body))
            ]),
            ...middleware0,
            ...middleware1,
            ...ctrlMiddleware1,
            methodsToHandler(controller5.post)
          ]
        }
      ]
    },
    {
      path: '/users/:userId',
      methods: [
        {
          name: 'get',
          handlers: [
            createTypedParamsHandler(['userId']),
            ...middleware0,
            ...middleware1,
            methodsToHandler(controller6.get)
          ]
        }
      ]
    }
  ]
}

export const entities = [Entity0]
export const migrations = []
export const subscribers = [Subscriber0]

export const run = async (fastify: FastifyInstance, config: Config) => {
  const router = express.Router()
  const ctrls = controllers(config)

  for (const ctrl of ctrls) {
    for (const method of ctrl.methods) {
      router[method.name](ctrl.path, method.handlers)
    }
  }

  await fastify.register(require('fastify-express'), { prefix: config.basePath })
  fastify.use(router)
  fastify.use(config.basePath || '/', express.static(path.join(__dirname, 'public')))

  await fastify.listen(config.port)
}

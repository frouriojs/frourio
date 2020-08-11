import path from 'path'
import createControllersText from './createControllersText'
import createTypeormText from './createTypeormText'

export default (input: string) => {
  const typeormText = createTypeormText(input)
  const { imports, controllers } = createControllersText(`${input}/api`)
  const hasTypedParams = controllers.includes('createTypedParamsHandler(')
  const hasTypeorm = !!typeormText.imports
  const hasValidator = controllers.includes('validateOrReject(')
  const hasMulter = controllers.includes('formatMulterData,')

  return {
    text: `/* eslint-disable */${hasMulter ? "\nimport path from 'path'" : ''}
import {${hasMulter ? '\n  $arrayTypeKeysName,' : ''}
  LowerHttpMethod,
  AspidaMethods,
  HttpMethod,
  HttpStatusOk,
  AspidaMethodParams
} from 'aspida'
import express, { RequestHandler${hasValidator ? ', Request' : ''} } from 'express'
import { FastifyInstance } from 'fastify'${
      hasMulter ? "\nimport multer, { Options } from 'multer'" : ''
    }${hasValidator ? "\nimport { validateOrReject } from 'class-validator'" : ''}

export const createMiddleware = <T extends RequestHandler | RequestHandler[]>(handler: T): T extends RequestHandler[] ? T : [T] => (Array.isArray(handler) ? handler : [handler]) as any
${typeormText.imports}${imports}

export type Config = {
  port: number
  basePath?: string
${
  hasMulter
    ? `  multer?: Options
}

export type MulterFile = Express.Multer.File`
    : '}'
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
${
  hasMulter
    ? `
type BlobToFile<T extends AspidaMethodParams> = T['reqFormat'] extends FormData
  ? {
      [P in keyof T['reqBody']]: Required<T['reqBody']>[P] extends Blob
        ? MulterFile
        : Required<T['reqBody']>[P] extends Blob[]
        ? MulterFile[]
        : T['reqBody'][P]
    }
  : T['reqBody']
`
    : ''
}
type RequestParams<T extends AspidaMethodParams> = {
  path: string
  method: HttpMethod
  query: T['query']
  body: ${hasMulter ? 'BlobToFile<T>' : "T['reqBody']"}
  headers: T['reqHeaders']
}

export type ServerMethods<T extends AspidaMethods, U extends ServerValues> = {
  [K in keyof T]: (
    req: RequestParams<T[K]> & U
  ) => ServerResponse<T[K]> | Promise<ServerResponse<T[K]>>
}
${
  hasTypedParams
    ? `
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
`
    : ''
}${
      hasValidator
        ? `
const createValidateHandler = (validators: (req: Request) => (Promise<void> | null)[]): RequestHandler =>
  (req, res, next) => Promise.all(validators(req)).then(() => next()).catch(() => res.sendStatus(400))
`
        : ''
    }
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
${
  hasMulter
    ? `
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
`
    : ''
}
export const controllers = (${hasMulter ? "config: Pick<Config, 'multer'>" : ''}): {
  path: string
  methods: {
    name: LowerHttpMethod
    handlers: RequestHandler[]
  }[]
}[] => {${
      hasMulter
        ? `
  const uploader = multer(
    config.multer ?? { dest: path.join(__dirname, '.upload'), limits: { fileSize: 1024 ** 3 } }
  ).any()
`
        : ''
    }
  return [
${controllers}
  ]
}
${
  hasTypeorm
    ? `
export const entities = [${typeormText.entities}]
export const migrations = [${typeormText.migrations}]
export const subscribers = [${typeormText.subscribers}]
`
    : ''
}
export const run = async (fastify: FastifyInstance, config: Config) => {
  const router = express.Router()
  const ctrls = controllers(${hasMulter ? 'config' : ''})

  for (const ctrl of ctrls) {
    for (const method of ctrl.methods) {
      router[method.name](ctrl.path, method.handlers)
    }
  }

  await fastify.register(require('fastify-express'), { prefix: config.basePath })
  fastify.use(router)

  await fastify.listen(config.port)
}
`,
    filePath: path.posix.join(input, '$app.ts')
  }
}

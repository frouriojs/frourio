import path from 'path'
import createControllersText from './createControllersText'
import checkRequisites from './checkRequisites'

const genHandlerText = (isAsync: boolean) => `
const ${isAsync ? 'asyncM' : 'm'}ethodToHandler = (
  methodCallback: ServerHandler${isAsync ? 'Promise' : ''}<any, any>
): RouteHandlerMethod => ${isAsync ? 'async ' : ''}(req, reply) => {
  const data = ${isAsync ? 'await ' : ''}methodCallback(req as any) as any

  if (data.headers) reply.headers(data.headers)

  reply.code(data.status).send(data.body)
}
`

export default (input: string, project?: string) => {
  const { imports, consts, controllers } = createControllersText(`${input}/api`, project ?? input)
  const hasNumberTypeQuery = controllers.includes('parseNumberTypeQueryParams(')
  const hasBooleanTypeQuery = controllers.includes('parseBooleanTypeQueryParams(')
  const hasOptionalQuery = controllers.includes(' callParserIfExistsQuery(')
  const hasNormalizeQuery = controllers.includes(' normalizeQuery')
  const hasTypedParams = controllers.includes(' createTypedParamsHandler(')
  const hasValidator = controllers.includes(' validateOrReject(')
  const hasMultipart = controllers.includes(' formatMultipartData(')
  const hasMethodToHandler = controllers.includes(' methodToHandler(')
  const hasAsyncMethodToHandler = controllers.includes(' asyncMethodToHandler(')
  const hasRouteShorthandOptions = controllers.includes(' as RouteShorthandOptions,')
  const hasValidatorCompiler = controllers.includes(' validatorCompiler')
  const hasValidatorsToSchema = controllers.includes('validatorsToSchema(')
  const headImports: string[] = []

  checkRequisites({ hasValidator })

  if (hasValidator) {
    console.warn(`'class-validator' is deprecated. Specify validators in controller instead.`)

    headImports.push(
      "import 'reflect-metadata'",
      "import type { ClassTransformOptions } from 'class-transformer'",
      "import { plainToInstance as defaultPlainToInstance } from 'class-transformer'",
      "import type { ValidatorOptions } from 'class-validator'",
      "import { validateOrReject as defaultValidateOrReject } from 'class-validator'"
    )
  }

  if (hasMultipart) {
    headImports.push(
      "import type { FastifyMultipartAttactFieldsToBodyOptions, Multipart } from '@fastify/multipart'",
      "import multipart from '@fastify/multipart'"
    )
  }

  if (hasValidator) {
    headImports.push("import * as Validators from './validators'")
  }

  if (hasMultipart) {
    headImports.push("import type { ReadStream } from 'fs'")
  }

  headImports.push("import type { HttpStatusOk, AspidaMethodParams } from 'aspida'")

  return {
    text: `${headImports.join('\n')}
import type { z } from 'zod'
${imports}
import type { FastifyInstance, RouteHandlerMethod${
      hasNumberTypeQuery || hasBooleanTypeQuery || hasTypedParams || hasValidator || hasMultipart
        ? ', preValidationHookHandler'
        : ''
    }${hasValidator ? ', FastifyRequest' : ''}${
      hasValidatorCompiler ? ', FastifySchema, FastifySchemaCompiler' : ''
    }${hasRouteShorthandOptions ? ', RouteShorthandOptions' : ''} } from 'fastify'

export type FrourioOptions = {
  basePath?: string | undefined
${
  hasValidator
    ? '  transformer?: ClassTransformOptions | undefined\n' +
      '  validator?: ValidatorOptions | undefined\n' +
      '  plainToInstance?: ((cls: new (...args: any[]) => object, object: unknown, options: ClassTransformOptions) => object) | undefined\n' +
      '  validateOrReject?: ((instance: object, options: ValidatorOptions) => Promise<void>) | undefined\n'
    : ''
}${hasMultipart ? '  multipart?: FastifyMultipartAttactFieldsToBodyOptions | undefined\n' : ''}}

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
${
  hasMultipart
    ? `
type BlobToFile<T extends AspidaMethodParams> = T['reqFormat'] extends FormData
  ? {
      [P in keyof T['reqBody']]: Required<T['reqBody']>[P] extends Blob | ReadStream
        ? Multipart
        : Required<T['reqBody']>[P] extends (Blob | ReadStream)[]
        ? Multipart[]
        : T['reqBody'][P]
    }
  : T['reqBody']
`
    : ''
}
type RequestParams<T extends AspidaMethodParams> = Pick<{
  query: T['query']
  body: ${hasMultipart ? 'BlobToFile<T>' : "T['reqBody']"}
  headers: T['reqHeaders']
}, {
  query: Required<T>['query'] extends {} | null ? 'query' : never
  body: Required<T>['reqBody'] extends {} | null ? 'body' : never
  headers: Required<T>['reqHeaders'] extends {} | null ? 'headers' : never
}['query' | 'body' | 'headers']>

type ServerHandler<T extends AspidaMethodParams, U extends Record<string, any> = {}> = (
  req: RequestParams<T> & U
) => ServerResponse<T>

type ServerHandlerPromise<T extends AspidaMethodParams, U extends Record<string, any> = {}> = (
  req: RequestParams<T> & U
) => Promise<ServerResponse<T>>

export type ServerMethodHandler<T extends AspidaMethodParams,  U extends Record<string, any> = {}> = ServerHandler<T, U> | ServerHandlerPromise<T, U> | {
  validators?: Partial<{ [Key in keyof RequestParams<T>]?: z.ZodType<RequestParams<T>[Key]>}>
  handler: ServerHandler<T, U> | ServerHandlerPromise<T, U>
}
${
  hasNumberTypeQuery
    ? `
const parseNumberTypeQueryParams = (numberTypeParams: [string, boolean, boolean][]): preValidationHookHandler => (req, reply, done) => {
  const query: any = req.query

  for (const [key, isOptional, isArray] of numberTypeParams) {
    const param = isArray ? (query[\`\${key}[]\`] ?? query[key]) : query[key]

    if (isArray) {
      if (!isOptional && param === undefined) {
        query[key] = []
      } else if (!isOptional || param !== undefined) {
        const vals = (Array.isArray(param) ? param : [param]).map(Number)

        if (vals.some(isNaN)) {
          reply.code(400).send()
          return
        }

        query[key] = vals as any
      }

      delete query[\`\${key}[]\`]
    } else if (!isOptional || param !== undefined) {
      const val = Number(param)

      if (isNaN(val)) {
        reply.code(400).send()
        return
      }

      query[key] = val as any
    }
  }

  done()
}
`
    : ''
}${
      hasBooleanTypeQuery
        ? `
const parseBooleanTypeQueryParams = (booleanTypeParams: [string, boolean, boolean][]): preValidationHookHandler => (req, reply, done) => {
  const query: any = req.query

  for (const [key, isOptional, isArray] of booleanTypeParams) {
    const param = isArray ? (query[\`\${key}[]\`] ?? query[key]) : query[key]

    if (isArray) {
      if (!isOptional && param === undefined) {
        query[key] = []
      } else if (!isOptional || param !== undefined) {
        const vals = (Array.isArray(param) ? param : [param]).map(p => p === 'true' ? true : p === 'false' ? false : null)

        if (vals.some(v => v === null)) {
          reply.code(400).send()
          return
        }

        query[key] = vals as any
      }

      delete query[\`\${key}[]\`]
    } else if (!isOptional || param !== undefined) {
      const val = param === 'true' ? true : param === 'false' ? false : null

      if (val === null) {
        reply.code(400).send()
        return
      }

      query[key] = val as any
    }
  }

  done()
}
`
        : ''
    }${
      hasOptionalQuery
        ? `
const callParserIfExistsQuery = (parser: OmitThisParameter<preValidationHookHandler>): preValidationHookHandler => (req, reply, done) =>
  Object.keys(req.query as any).length ? parser(req, reply, done) : done()
`
        : ''
    }${
      hasNormalizeQuery
        ? `
const normalizeQuery: preValidationHookHandler = (req, _, done) => {
  req.query = JSON.parse(JSON.stringify(req.query))
  done()
}
`
        : ''
    }${
      hasTypedParams
        ? `
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
`
        : ''
    }${
      hasValidator
        ? `
const createValidateHandler = (validators: (req: FastifyRequest) => (Promise<void> | null)[]): preValidationHookHandler =>
  (req, reply) => Promise.all(validators(req)).catch(err => reply.code(400).send(err))
`
        : ''
    }${
      hasMultipart
        ? `
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
`
        : ''
    }${
      hasValidatorCompiler
        ? `
const validatorCompiler: FastifySchemaCompiler<FastifySchema> = ({ schema }) => (data: unknown) => {
  const result = (schema as z.ZodType<unknown>).safeParse(data)
  return result.success ? { value: result.data } : { error: result.error }
}${
            hasValidatorsToSchema
              ? `

const validatorsToSchema = (validator?: { query?: unknown; body?: unknown; headers?: unknown }): FastifySchema => ({
  querystring: validator?.query,
  body: validator?.body,
  headers: validator?.headers
})`
              : ''
          }
`
        : ''
    }${hasMethodToHandler ? genHandlerText(false) : ''}${
      hasAsyncMethodToHandler ? genHandlerText(true) : ''
    }
export default (fastify: FastifyInstance, options: FrourioOptions = {}) => {
  const basePath = options.basePath ?? ''
${
  hasValidator
    ? '  const transformerOptions: ClassTransformOptions = { enableCircularCheck: true, ...options.transformer }\n' +
      '  const validatorOptions: ValidatorOptions = { validationError: { target: false }, ...options.validator }\n' +
      '  const { plainToInstance = defaultPlainToInstance as NonNullable<FrourioOptions["plainToInstance"]>, validateOrReject = defaultValidateOrReject as NonNullable<FrourioOptions["validateOrReject"]> } = options\n'
    : ''
}${consts}
${
  hasMultipart
    ? '  fastify.register(multipart, { attachFieldsToBody: true, limits: { fileSize: 1024 ** 3 }, ...options.multipart })\n\n'
    : ''
}${controllers}
  return fastify
}
`,
    filePath: path.posix.join(input, '$server.ts')
  }
}

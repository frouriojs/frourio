import type { MultipartFile } from '@fastify/multipart';
import type { ReadStream } from 'fs';
import type { HttpStatusOk, AspidaMethodParams } from 'aspida';
import type { Schema } from 'fast-json-stringify';
import type { z } from 'zod';
import hooksFn_gx3glp from './api/hooks';
import hooksFn_3zqb7e from './api/users/hooks';
import validatorsFn_ia9y8g from './api/users/_userId@number/validators';
import controllerFn_14i7wcv from './api/controller';
import controllerFn_a01vkg from './api/empty/noEmpty/controller';
import controllerFn_1gxm9v2 from './api/texts/controller';
import controllerFn_1bjhajh from './api/texts/sample/controller';
import controllerFn_g6e9u2 from './api/users/controller';
import controllerFn_1y88f1f from './api/users/_userId@number/controller';
import type { FastifyInstance, RouteHandlerMethod, preValidationHookHandler, FastifySchema, FastifySchemaCompiler, RouteShorthandOptions, onRequestHookHandler, preParsingHookHandler, preHandlerHookHandler } from 'fastify';

export type FrourioOptions = {
  basePath?: string;
};

type HttpStatusNoOk = 301 | 302 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 409 | 500 | 501 | 502 | 503 | 504 | 505;

type PartiallyPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type BaseResponse<T, U, V> = {
  status: V extends number ? V : HttpStatusOk;
  body: T;
  headers: U;
};

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
  | PartiallyPartial<BaseResponse<any, any, HttpStatusNoOk>, 'body' | 'headers'>;

export type MultipartFileToBlob<T extends Record<string, unknown>> = {
  [P in keyof T]: Required<T>[P] extends MultipartFile
    ? Blob | ReadStream
    : Required<T>[P] extends MultipartFile[]
    ? (Blob | ReadStream)[]
    : T[P];
};

type RequestParams<T extends AspidaMethodParams> = Pick<{
  query: T['query'];
  body: T['reqBody'];
  headers: T['reqHeaders'];
}, {
  query: Required<T>['query'] extends {} | null ? 'query' : never;
  body: Required<T>['reqBody'] extends {} | null ? 'body' : never;
  headers: Required<T>['reqHeaders'] extends {} | null ? 'headers' : never;
}['query' | 'body' | 'headers']>;

type ServerHandler<T extends AspidaMethodParams, U extends Record<string, unknown> = {}> = (
  req: RequestParams<T> & U,
) => ServerResponse<T>;

type ServerHandlerPromise<T extends AspidaMethodParams, U extends Record<string, unknown> = {}> = (
  req: RequestParams<T> & U,
) => Promise<ServerResponse<T>>;

type AddedHandler<T, R extends Record<string, unknown>> = T extends (req: infer U, ...args: infer V) => infer W ? (req: U & Partial<R>, ...args: V) => W : never;

export type ServerHooks<R extends Record<string, unknown> = {}> = {
  onRequest?: AddedHandler<onRequestHookHandler, R> | AddedHandler<onRequestHookHandler, R>[];
  preParsing?: AddedHandler<preParsingHookHandler, R> | AddedHandler<preParsingHookHandler, R>[];
  preValidation?: AddedHandler<preValidationHookHandler, R> | AddedHandler<preValidationHookHandler, R>[];
  preHandler?: AddedHandler<preHandlerHookHandler, R> | AddedHandler<preHandlerHookHandler, R>[];
};

export type ServerMethodHandler<T extends AspidaMethodParams,  U extends Record<string, unknown> = {}> = ServerHandler<T, U> | ServerHandlerPromise<T, U> | {
  validators?: { [Key in keyof RequestParams<T>]?: z.ZodType<RequestParams<T>[Key]>};
  schemas?: { response?: { [V in HttpStatusOk]?: Schema }};
  hooks?: ServerHooks<U>;
  handler: ServerHandler<T, U> | ServerHandlerPromise<T, U>;
};

const createTypedParamsHandler = (numberTypeParams: string[]): preValidationHookHandler => (req, reply, done) => {
  const params = req.params as Record<string, string | number>;

  for (const key of numberTypeParams) {
    const val = Number(params[key]);

    if (isNaN(val)) {
      reply.code(400).send();
      return;
    }

    params[key] = val;
  }

  done();
};

const validatorCompiler: FastifySchemaCompiler<FastifySchema> = ({ schema }) => (data: unknown) => {
  const result = (schema as z.ZodType<unknown>).safeParse(data);
  return result.success ? { value: result.data } : { error: result.error };
};

const methodToHandler = (
  methodCallback: ServerHandler<any, any>,
): RouteHandlerMethod => (req, reply) => {
  const data = methodCallback(req as any) as any;

  if (data.headers !== undefined) reply.headers(data.headers);

  reply.code(data.status).send(data.body);
};

const asyncMethodToHandler = (
  methodCallback: ServerHandlerPromise<any, any>,
): RouteHandlerMethod => async (req, reply) => {
  const data = await methodCallback(req as any) as any;

  if (data.headers !== undefined) reply.headers(data.headers);

  reply.code(data.status).send(data.body);
};

export default (fastify: FastifyInstance, options: FrourioOptions = {}) => {
  const basePath = options.basePath ?? '';
  const hooks_gx3glp = hooksFn_gx3glp(fastify);
  const hooks_3zqb7e = hooksFn_3zqb7e(fastify);
  const validators_ia9y8g = validatorsFn_ia9y8g(fastify);
  const controller_14i7wcv = controllerFn_14i7wcv(fastify);
  const controller_a01vkg = controllerFn_a01vkg(fastify);
  const controller_1gxm9v2 = controllerFn_1gxm9v2(fastify);
  const controller_1bjhajh = controllerFn_1bjhajh(fastify);
  const controller_g6e9u2 = controllerFn_g6e9u2(fastify);
  const controller_1y88f1f = controllerFn_1y88f1f(fastify);

  fastify.get(
    basePath || '/',
    {
      onRequest: hooks_gx3glp.onRequest,
    },
    // @ts-expect-error
    asyncMethodToHandler(controller_14i7wcv.get),
  );

  fastify.post(
    basePath || '/',
    {
      onRequest: hooks_gx3glp.onRequest,
    },
    // @ts-expect-error
    methodToHandler(controller_14i7wcv.post),
  );

  fastify.get(
    `${basePath}/empty/noEmpty`,
    {
      onRequest: hooks_gx3glp.onRequest,
    },
    methodToHandler(controller_a01vkg.get),
  );

  fastify.get(
    `${basePath}/texts`,
    {
      onRequest: hooks_gx3glp.onRequest,
    },
    // @ts-expect-error
    methodToHandler(controller_1gxm9v2.get),
  );

  fastify.put(
    `${basePath}/texts`,
    {
      onRequest: hooks_gx3glp.onRequest,
    },
    // @ts-expect-error
    methodToHandler(controller_1gxm9v2.put),
  );

  fastify.put(
    `${basePath}/texts/sample`,
    {
      onRequest: hooks_gx3glp.onRequest,
    },
    methodToHandler(controller_1bjhajh.put),
  );

  fastify.get(
    `${basePath}/users`,
    {
      onRequest: [hooks_gx3glp.onRequest, hooks_3zqb7e.onRequest],
    } as RouteShorthandOptions,
    asyncMethodToHandler(controller_g6e9u2.get),
  );

  fastify.post(
    `${basePath}/users`,
    {
      onRequest: [hooks_gx3glp.onRequest, hooks_3zqb7e.onRequest],
    } as RouteShorthandOptions,
    methodToHandler(controller_g6e9u2.post),
  );

  fastify.get(
    `${basePath}/users/:userId`,
    {
      schema: {
        params: validators_ia9y8g.params,
      },
      validatorCompiler,
      onRequest: [hooks_gx3glp.onRequest, hooks_3zqb7e.onRequest],
      preValidation: createTypedParamsHandler(['userId']),
    } as RouteShorthandOptions,
    methodToHandler(controller_1y88f1f.get),
  );

  return fastify;
};

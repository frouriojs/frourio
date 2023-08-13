import type { MultipartFile } from '@fastify/multipart';
import type { ReadStream } from 'fs';
import type { HttpStatusOk, AspidaMethodParams } from 'aspida';
import type { Schema } from 'fast-json-stringify';
import type { z } from 'zod';
import hooksFn0 from './api/hooks';
import hooksFn1 from './api/users/hooks';
import validatorsFn0 from './api/users/_userId@number/validators';
import controllerFn0 from './api/controller';
import controllerFn1 from './api/empty/noEmpty/controller';
import controllerFn2 from './api/texts/controller';
import controllerFn3 from './api/texts/sample/controller';
import controllerFn4 from './api/users/controller';
import controllerFn5 from './api/users/_userId@number/controller';
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
  const hooks0 = hooksFn0(fastify);
  const hooks1 = hooksFn1(fastify);
  const validators0 = validatorsFn0(fastify);
  const controller0 = controllerFn0(fastify);
  const controller1 = controllerFn1(fastify);
  const controller2 = controllerFn2(fastify);
  const controller3 = controllerFn3(fastify);
  const controller4 = controllerFn4(fastify);
  const controller5 = controllerFn5(fastify);

  fastify.get(
    basePath || '/',
    {
      onRequest: hooks0.onRequest,
    },
    // @ts-expect-error
    asyncMethodToHandler(controller0.get),
  );

  fastify.post(
    basePath || '/',
    {
      onRequest: hooks0.onRequest,
    },
    // @ts-expect-error
    methodToHandler(controller0.post),
  );

  fastify.get(
    `${basePath}/empty/noEmpty`,
    {
      onRequest: hooks0.onRequest,
    },
    methodToHandler(controller1.get),
  );

  fastify.get(
    `${basePath}/texts`,
    {
      onRequest: hooks0.onRequest,
    },
    // @ts-expect-error
    methodToHandler(controller2.get),
  );

  fastify.put(
    `${basePath}/texts`,
    {
      onRequest: hooks0.onRequest,
    },
    // @ts-expect-error
    methodToHandler(controller2.put),
  );

  fastify.put(
    `${basePath}/texts/sample`,
    {
      onRequest: hooks0.onRequest,
    },
    methodToHandler(controller3.put),
  );

  fastify.get(
    `${basePath}/users`,
    {
      onRequest: [hooks0.onRequest, hooks1.onRequest],
    } as RouteShorthandOptions,
    asyncMethodToHandler(controller4.get),
  );

  fastify.post(
    `${basePath}/users`,
    {
      onRequest: [hooks0.onRequest, hooks1.onRequest],
    } as RouteShorthandOptions,
    methodToHandler(controller4.post),
  );

  fastify.get(
    `${basePath}/users/:userId`,
    {
      schema: {
        params: validators0.params,
      },
      validatorCompiler,
      onRequest: [hooks0.onRequest, hooks1.onRequest],
      preValidation: createTypedParamsHandler(['userId']),
    } as RouteShorthandOptions,
    methodToHandler(controller5.get),
  );

  return fastify;
};

import multipart from '@fastify/multipart';
import type { FastifyMultipartAttachFieldsToBodyOptions, Multipart, MultipartFile } from '@fastify/multipart';
import type { ReadStream } from 'fs';
import type { HttpStatusOk, AspidaMethodParams } from 'aspida';
import type { Schema } from 'fast-json-stringify';
import type { z } from 'zod';
import hooksFn_gx3glp from './api/hooks';
import hooksFn_1mq914j from './api/empty/hooks';
import hooksFn_3zqb7e from './api/users/hooks';
import hooksFn_1xe76mo from './api/users/_userId@number/_name/hooks';
import validatorsFn_1etvysi from './api/texts/_label@string/validators';
import validatorsFn_ia9y8g from './api/users/_userId@number/validators';
import validatorsFn_bsbcs3 from './api/users/_userId@number/_name/validators';
import controllerFn_14i7wcv from './api/controller';
import controllerFn_50cggr from './api/500/controller';
import controllerFn_a01vkg from './api/empty/noEmpty/controller';
import controllerFn_17nfdm3 from './api/multiForm/controller';
import controllerFn_1gxm9v2 from './api/texts/controller';
import controllerFn_1bjhajh from './api/texts/sample/controller';
import controllerFn_iyz1e5 from './api/texts/_label@string/controller';
import controllerFn_g6e9u2 from './api/users/controller';
import controllerFn_1y88f1f from './api/users/_userId@number/controller';
import controllerFn_1pjj81w from './api/users/_userId@number/_name/controller';
import controllerFn_iyk7j5 from './api/zod/controller';
import type { FastifyInstance, RouteHandlerMethod, preValidationHookHandler, FastifySchema, FastifySchemaCompiler, RouteShorthandOptions, onRequestHookHandler, preParsingHookHandler, preHandlerHookHandler } from 'fastify';

export type FrourioOptions = {
  basePath?: string;
  multipart?: FastifyMultipartAttachFieldsToBodyOptions;
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

type BlobToFile<T extends AspidaMethodParams> = T['reqFormat'] extends FormData
  ? {
      [P in keyof T['reqBody']]: Required<T['reqBody']>[P] extends Blob | ReadStream
        ? MultipartFile
        : Required<T['reqBody']>[P] extends (Blob | ReadStream)[]
        ? MultipartFile[]
        : T['reqBody'][P];
    }
  : T['reqBody'];

type RequestParams<T extends AspidaMethodParams> = Pick<{
  query: T['query'];
  body: BlobToFile<T>;
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

const parseStringArrayTypeQueryParams = (stringArrayTypeParams: [string, boolean][]): preValidationHookHandler => (req, reply, done) => {
  const query: any = req.query;

  for (const [key, isOptional] of stringArrayTypeParams) {
    const param = query[`${key}[]`] ?? query[key];

    if (!isOptional && param === undefined) {
      query[key] = [];
    } else if (!isOptional || param !== undefined) {
      const vals = (Array.isArray(param) ? param : [param]);

      query[key] = vals;
    }

    delete query[`${key}[]`];
  }

  done();
};

const parseNumberTypeQueryParams = (numberTypeParams: [string, boolean, boolean][]): preValidationHookHandler => (req, reply, done) => {
  const query: any = req.query;

  for (const [key, isOptional, isArray] of numberTypeParams) {
    const param = isArray ? (query[`${key}[]`] ?? query[key]) : query[key];

    if (isArray) {
      if (!isOptional && param === undefined) {
        query[key] = [];
      } else if (!isOptional || param !== undefined) {
        const vals = (Array.isArray(param) ? param : [param]).map(Number);

        if (vals.some(isNaN)) {
          reply.code(400).send();
          return;
        }

        query[key] = vals;
      }

      delete query[`${key}[]`];
    } else if (!isOptional || param !== undefined) {
      const val = Number(param);

      if (isNaN(val)) {
        reply.code(400).send();
        return;
      }

      query[key] = val;
    }
  }

  done();
};

const parseBooleanTypeQueryParams = (booleanTypeParams: [string, boolean, boolean][]): preValidationHookHandler => (req, reply, done) => {
  const query: any = req.query;

  for (const [key, isOptional, isArray] of booleanTypeParams) {
    const param = isArray ? (query[`${key}[]`] ?? query[key]) : query[key];

    if (isArray) {
      if (!isOptional && param === undefined) {
        query[key] = [];
      } else if (!isOptional || param !== undefined) {
        const vals = (Array.isArray(param) ? param : [param]).map(p => p === 'true' ? true : p === 'false' ? false : null);

        if (vals.some(v => v === null)) {
          reply.code(400).send();
          return;
        }

        query[key] = vals;
      }

      delete query[`${key}[]`];
    } else if (!isOptional || param !== undefined) {
      const val = param === 'true' ? true : param === 'false' ? false : null;

      if (val === null) {
        reply.code(400).send();
        return;
      }

      query[key] = val;
    }
  }

  done();
};

const callParserIfExistsQuery = (parser: OmitThisParameter<preValidationHookHandler>): preValidationHookHandler => (req, reply, done) =>
  Object.keys(req.query as any).length ? parser(req, reply, done) : done();

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

const formatMultipartData = (arrayTypeKeys: [string, boolean][], numberTypeKeys: [string, boolean, boolean][], booleanTypeKeys: [string, boolean, boolean][]): preValidationHookHandler => (req, reply, done) => {
  const body: any = req.body;

  for (const [key] of arrayTypeKeys) {
    if (body[key] === undefined) body[key] = [];
    else if (!Array.isArray(body[key])) {
      body[key] = [body[key]];
    }
  }

  Object.entries(body).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      body[key] = (val as Multipart[]).map(v => 'file' in v ? v : (v as any).value);
    } else {
      body[key] = 'file' in (val as Multipart) ? val : (val as any).value;
    }
  });

  for (const [key, isOptional] of arrayTypeKeys) {
    if (!body[key].length && isOptional) delete body[key];
  }

  for (const [key, isOptional, isArray] of numberTypeKeys) {
    const param = body[key];

    if (isArray) {
      if (!isOptional || param !== undefined) {
        const vals = param.map(Number);

        if (vals.some(isNaN)) {
          reply.code(400).send();
          return;
        }

        body[key] = vals
      }
    } else if (!isOptional || param !== undefined) {
      const val = Number(param);

      if (isNaN(val)) {
        reply.code(400).send();
        return;
      }

      body[key] = val
    }
  }

  for (const [key, isOptional, isArray] of booleanTypeKeys) {
    const param = body[key];

    if (isArray) {
      if (!isOptional || param !== undefined) {
        const vals = param.map((p: string) => p === 'true' ? true : p === 'false' ? false : null);

        if (vals.some((v: string | null) => v === null)) {
          reply.code(400).send();
          return;
        }

        body[key] = vals
      }
    } else if (!isOptional || param !== undefined) {
      const val = param === 'true' ? true : param === 'false' ? false : null;

      if (val === null) {
        reply.code(400).send();
        return;
      }

      body[key] = val
    }
  }

  done();
};

const validatorCompiler: FastifySchemaCompiler<FastifySchema> = ({ schema }) => (data: unknown) => {
  const result = (schema as z.ZodType<unknown>).safeParse(data);
  return result.success ? { value: result.data } : { error: result.error };
};

const validatorsToSchema = ({ query, ...validators }: { query?: unknown; body?: unknown; headers?: unknown }): FastifySchema => ({
  ...(query !== undefined ? { querystring: query } : {}),
  ...validators,
});

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
  const hooks_1mq914j = hooksFn_1mq914j(fastify);
  const hooks_3zqb7e = hooksFn_3zqb7e(fastify);
  const hooks_1xe76mo = hooksFn_1xe76mo(fastify);
  const validators_1etvysi = validatorsFn_1etvysi(fastify);
  const validators_ia9y8g = validatorsFn_ia9y8g(fastify);
  const validators_bsbcs3 = validatorsFn_bsbcs3(fastify);
  const controller_14i7wcv = controllerFn_14i7wcv(fastify);
  const controller_50cggr = controllerFn_50cggr(fastify);
  const controller_a01vkg = controllerFn_a01vkg(fastify);
  const controller_17nfdm3 = controllerFn_17nfdm3(fastify);
  const controller_1gxm9v2 = controllerFn_1gxm9v2(fastify);
  const controller_1bjhajh = controllerFn_1bjhajh(fastify);
  const controller_iyz1e5 = controllerFn_iyz1e5(fastify);
  const controller_g6e9u2 = controllerFn_g6e9u2(fastify);
  const controller_1y88f1f = controllerFn_1y88f1f(fastify);
  const controller_1pjj81w = controllerFn_1pjj81w(fastify);
  const controller_iyk7j5 = controllerFn_iyk7j5(fastify);

  fastify.register(multipart, { attachFieldsToBody: true, limits: { fileSize: 1024 ** 3 }, ...options.multipart });

  fastify.get(
    basePath || '/',
    {
      schema: validatorsToSchema(controller_14i7wcv.get.validators),
      validatorCompiler,
      onRequest: hooks_gx3glp.onRequest,
      preParsing: hooks_gx3glp.preParsing,
      preValidation: [
        callParserIfExistsQuery(parseStringArrayTypeQueryParams([['strArray', false], ['optionalStrArray', true]])),
        callParserIfExistsQuery(parseNumberTypeQueryParams([['requiredNum', false, false], ['optionalNum', true, false], ['optionalNumArr', true, true], ['emptyNum', true, false], ['requiredNumArr', false, true]])),
        callParserIfExistsQuery(parseBooleanTypeQueryParams([['bool', false, false], ['optionalBool', true, false], ['boolArray', false, true], ['optionalBoolArray', true, true]])),
      ],
    },
    asyncMethodToHandler(controller_14i7wcv.get.handler),
  );

  fastify.post(
    basePath || '/',
    {
      schema: validatorsToSchema(controller_14i7wcv.post.validators),
      validatorCompiler,
      onRequest: hooks_gx3glp.onRequest,
      preParsing: hooks_gx3glp.preParsing,
      preValidation: [
        parseStringArrayTypeQueryParams([['strArray', false], ['optionalStrArray', true]]),
        parseNumberTypeQueryParams([['requiredNum', false, false], ['optionalNum', true, false], ['optionalNumArr', true, true], ['emptyNum', true, false], ['requiredNumArr', false, true]]),
        parseBooleanTypeQueryParams([['bool', false, false], ['optionalBool', true, false], ['boolArray', false, true], ['optionalBoolArray', true, true]]),
        formatMultipartData([['optionalNumArr', true], ['requiredNumArr', false], ['boolArray', false], ['optionalBoolArray', true]], [['requiredNum', false, false], ['optionalNum', true, false], ['optionalNumArr', true, true], ['emptyNum', true, false], ['requiredNumArr', false, true]], [['bool', false, false], ['optionalBool', true, false], ['boolArray', false, true], ['optionalBoolArray', true, true]]),
      ],
    },
    methodToHandler(controller_14i7wcv.post.handler),
  );

  fastify.put(
    basePath || '/',
    {
      schema: {
        ...validatorsToSchema(controller_14i7wcv.put.validators),
        ...controller_14i7wcv.put.schemas,
      },
      validatorCompiler,
      onRequest: hooks_gx3glp.onRequest,
      preParsing: hooks_gx3glp.preParsing,
      preValidation: [
        parseStringArrayTypeQueryParams([['strArray', false], ['optionalStrArray', true]]),
        parseNumberTypeQueryParams([['requiredNum', false, false], ['optionalNum', true, false], ['optionalNumArr', true, true], ['emptyNum', true, false], ['requiredNumArr', false, true]]),
        parseBooleanTypeQueryParams([['bool', false, false], ['optionalBool', true, false], ['boolArray', false, true], ['optionalBoolArray', true, true]]),
        ...controller_14i7wcv.put.hooks.preValidation,
      ],
      preHandler: controller_14i7wcv.put.hooks.preHandler,
    },
    methodToHandler(controller_14i7wcv.put.handler),
  );

  fastify.get(
    `${basePath}/500`,
    {
      onRequest: hooks_gx3glp.onRequest,
      preParsing: hooks_gx3glp.preParsing,
    },
    methodToHandler(controller_50cggr.get),
  );

  fastify.get(
    `${basePath}/empty/noEmpty`,
    {
      onRequest: [...hooks_gx3glp.onRequest, ...hooks_1mq914j.onRequest],
      preParsing: [hooks_gx3glp.preParsing, hooks_1mq914j.preParsing],
    },
    asyncMethodToHandler(controller_a01vkg.get),
  );

  fastify.post(
    `${basePath}/multiForm`,
    {
      schema: validatorsToSchema(controller_17nfdm3.post.validators),
      validatorCompiler,
      onRequest: hooks_gx3glp.onRequest,
      preParsing: hooks_gx3glp.preParsing,
      preValidation: formatMultipartData([['requiredArr', false], ['optionalArr', true], ['empty', true], ['vals', false], ['files', false]], [['empty', true, true]], []),
    },
    asyncMethodToHandler(controller_17nfdm3.post.handler),
  );

  fastify.get(
    `${basePath}/texts`,
    {
      onRequest: hooks_gx3glp.onRequest,
      preParsing: hooks_gx3glp.preParsing,
      preValidation: callParserIfExistsQuery(parseNumberTypeQueryParams([['limit', true, false]])),
    },
    // @ts-expect-error
    methodToHandler(controller_1gxm9v2.get),
  );

  fastify.put(
    `${basePath}/texts`,
    {
      onRequest: hooks_gx3glp.onRequest,
      preParsing: hooks_gx3glp.preParsing,
    },
    // @ts-expect-error
    methodToHandler(controller_1gxm9v2.put),
  );

  fastify.put(
    `${basePath}/texts/sample`,
    {
      onRequest: hooks_gx3glp.onRequest,
      preParsing: hooks_gx3glp.preParsing,
    },
    methodToHandler(controller_1bjhajh.put),
  );

  fastify.get(
    `${basePath}/texts/:label`,
    {
      schema: {
        ...validatorsToSchema(controller_iyz1e5.get.validators),
        params: validators_1etvysi.params,
      },
      validatorCompiler,
      onRequest: hooks_gx3glp.onRequest,
      preParsing: hooks_gx3glp.preParsing,
    },
    methodToHandler(controller_iyz1e5.get.handler),
  );

  fastify.get(
    `${basePath}/users`,
    {
      onRequest: [...hooks_gx3glp.onRequest, hooks_3zqb7e.onRequest],
      preParsing: hooks_gx3glp.preParsing,
    } as RouteShorthandOptions,
    asyncMethodToHandler(controller_g6e9u2.get),
  );

  fastify.post(
    `${basePath}/users`,
    {
      schema: validatorsToSchema(controller_g6e9u2.post.validators),
      validatorCompiler,
      onRequest: [...hooks_gx3glp.onRequest, hooks_3zqb7e.onRequest],
      preParsing: hooks_gx3glp.preParsing,
    } as RouteShorthandOptions,
    methodToHandler(controller_g6e9u2.post.handler),
  );

  fastify.get(
    `${basePath}/users/:userId`,
    {
      schema: {
        params: validators_ia9y8g.params,
      },
      validatorCompiler,
      onRequest: [...hooks_gx3glp.onRequest, hooks_3zqb7e.onRequest],
      preParsing: hooks_gx3glp.preParsing,
      preValidation: createTypedParamsHandler(['userId']),
      preHandler: controller_1y88f1f.get.hooks.preHandler,
    } as RouteShorthandOptions,
    methodToHandler(controller_1y88f1f.get.handler),
  );

  fastify.get(
    `${basePath}/users/:userId/:name`,
    {
      schema: {
        params: validators_ia9y8g.params.and(validators_bsbcs3.params),
      },
      validatorCompiler,
      onRequest: [...hooks_gx3glp.onRequest, hooks_3zqb7e.onRequest, hooks_1xe76mo.onRequest],
      preParsing: hooks_gx3glp.preParsing,
      preValidation: createTypedParamsHandler(['userId']),
    } as RouteShorthandOptions,
    methodToHandler(controller_1pjj81w.get),
  );

  fastify.get(
    `${basePath}/zod`,
    {
      schema: validatorsToSchema(controller_iyk7j5.get.validators),
      validatorCompiler,
      onRequest: hooks_gx3glp.onRequest,
      preParsing: hooks_gx3glp.preParsing,
      preValidation: [
        parseNumberTypeQueryParams([['requiredNum', false, false], ['requiredNumArr', false, true], ['optionalNum', true, false], ['optionalNumArr', true, true], ['emptyNum', true, false]]),
        parseBooleanTypeQueryParams([['bool', false, false], ['boolArray', false, true], ['optionalBool', true, false], ['optionalBoolArray', true, true]]),
      ],
    },
    methodToHandler(controller_iyk7j5.get.handler),
  );

  fastify.post(
    `${basePath}/zod`,
    {
      schema: validatorsToSchema(controller_iyk7j5.post.validators),
      validatorCompiler,
      onRequest: hooks_gx3glp.onRequest,
      preParsing: hooks_gx3glp.preParsing,
      preValidation: [
        callParserIfExistsQuery(parseNumberTypeQueryParams([['requiredNum', false, false], ['requiredNumArr', false, true], ['optionalNum', true, false], ['optionalNumArr', true, true], ['emptyNum', true, false]])),
        callParserIfExistsQuery(parseBooleanTypeQueryParams([['bool', false, false], ['boolArray', false, true], ['optionalBool', true, false], ['optionalBoolArray', true, true]])),
      ],
    },
    methodToHandler(controller_iyk7j5.post.handler),
  );

  fastify.put(
    `${basePath}/zod`,
    {
      schema: validatorsToSchema(controller_iyk7j5.put.validators),
      validatorCompiler,
      onRequest: hooks_gx3glp.onRequest,
      preParsing: hooks_gx3glp.preParsing,
      preValidation: formatMultipartData([['requiredArr', false], ['vals', false], ['files', false], ['optionalArr', true], ['empty', true]], [['vals', false, true], ['empty', true, true]], []),
    },
    methodToHandler(controller_iyk7j5.put.handler),
  );

  return fastify;
};

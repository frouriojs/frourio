import { z } from 'zod'
import type { Injectable } from 'velona'
import { depend } from 'velona'
import type { FastifyInstance, onRequestHookHandler, preParsingHookHandler, preValidationHookHandler, preHandlerHookHandler } from 'fastify'
import type { Schema } from 'fast-json-stringify'
import type { HttpStatusOk } from 'aspida'
import type { ServerMethodHandler } from '../../$server'
import type { Methods } from './'

type Hooks = {
  onRequest?: onRequestHookHandler | onRequestHookHandler[] | undefined
  preParsing?: preParsingHookHandler | preParsingHookHandler[] | undefined
  preValidation?: preValidationHookHandler | preValidationHookHandler[] | undefined
  preHandler?: preHandlerHookHandler | preHandlerHookHandler[] | undefined
}

export function defineValidators(validator: (fastify: FastifyInstance) => {
  body?: z.ZodType,
  query?: z.ZodType<Record<string, unknown>>,
  headers?: z.ZodType<Record<string, string>>
}) {
  return validator
}

export function defineResponseSchema<T extends { [U in keyof Methods]?: { [V in HttpStatusOk]?: Schema | undefined } | undefined}>(methods: () => T) {
  return methods
}

export function defineHooks<T extends Hooks>(hooks: (fastify: FastifyInstance) => T): (fastify: FastifyInstance) => T
export function defineHooks<T extends Record<string, any>, U extends Hooks>(deps: T, cb: (d: T, fastify: FastifyInstance) => U): Injectable<T, [FastifyInstance], U>
export function defineHooks<T extends Record<string, any>>(hooks: (fastify: FastifyInstance) => Hooks | T, cb?: ((deps: T, fastify: FastifyInstance) => Hooks) | undefined) {
  return cb && typeof hooks !== 'function' ? depend(hooks, cb) : hooks
}

type ServerMethods = {
  [Key in keyof Methods]: ServerMethodHandler<Methods[Key]>
}

export function defineController<M extends ServerMethods>(methods: (fastify: FastifyInstance) => M): (fastify: FastifyInstance) => M
export function defineController<M extends ServerMethods, T extends Record<string, any>>(deps: T, cb: (d: T, fastify: FastifyInstance) => M): Injectable<T, [FastifyInstance], M>
export function defineController<M extends ServerMethods, T extends Record<string, any>>(methods: ((fastify: FastifyInstance) => M) | T, cb?: ((deps: T, fastify: FastifyInstance) => M) | undefined) {
  return cb && typeof methods !== 'function' ? depend(methods, cb) : methods
}

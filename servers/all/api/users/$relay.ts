import type { Injectable } from 'velona'
import { depend } from 'velona'
import type { FastifyInstance, onRequestHookHandler, preParsingHookHandler, preValidationHookHandler, preHandlerHookHandler } from 'fastify'
import type { Schema } from 'fast-json-stringify'
import type { HttpStatusOk } from 'aspida'
import type { ServerMethods } from '../../$server'
import type { AdditionalRequest as AdditionalRequest0 } from './hooks'
import type { AdditionalRequest as AdditionalRequest1 } from './controller'
import type { Methods } from './'

type AdditionalRequest = AdditionalRequest0 & AdditionalRequest1
type AddedHandler<T> = T extends (req: infer U, ...args: infer V) => infer W ? (req: U & Partial<AdditionalRequest>, ...args: V) => W : never
type Hooks = {
  onRequest?: AddedHandler<onRequestHookHandler> | AddedHandler<onRequestHookHandler>[] | undefined
  preParsing?: AddedHandler<preParsingHookHandler> | AddedHandler<preParsingHookHandler>[] | undefined
  preValidation?: AddedHandler<preValidationHookHandler> | AddedHandler<preValidationHookHandler>[] | undefined
  preHandler?: AddedHandler<preHandlerHookHandler> | AddedHandler<preHandlerHookHandler>[] | undefined
}
type ControllerMethods = ServerMethods<Methods, AdditionalRequest>

export function defineResponseSchema<T extends { [U in keyof ControllerMethods]?: { [V in HttpStatusOk]?: Schema | undefined } | undefined}>(methods: () => T) {
  return methods
}

export function defineHooks<T extends Hooks>(hooks: (fastify: FastifyInstance) => T): (fastify: FastifyInstance) => T
export function defineHooks<T extends Record<string, any>, U extends Hooks>(deps: T, cb: (d: T, fastify: FastifyInstance) => U): Injectable<T, [FastifyInstance], U>
export function defineHooks<T extends Record<string, any>>(hooks: (fastify: FastifyInstance) => Hooks | T, cb?: ((deps: T, fastify: FastifyInstance) => Hooks) | undefined) {
  return cb && typeof hooks !== 'function' ? depend(hooks, cb) : hooks
}

export function defineController(methods: (fastify: FastifyInstance) => ControllerMethods): (fastify: FastifyInstance) => ControllerMethods
export function defineController<T extends Record<string, any>>(deps: T, cb: (d: T, fastify: FastifyInstance) => ControllerMethods): Injectable<T, [FastifyInstance], ControllerMethods>
export function defineController<T extends Record<string, any>>(methods: (fastify: FastifyInstance) => ControllerMethods | T, cb?: ((deps: T, fastify: FastifyInstance) => ControllerMethods) | undefined) {
  return cb && typeof methods !== 'function' ? depend(methods, cb) : methods
}

/* eslint-disable */
import { FastifyInstance, onRequestHookHandler, preParsingHookHandler, preValidationHookHandler, preHandlerHookHandler } from 'fastify'
import { Schema } from 'fast-json-stringify'
import { HttpStatusOk } from 'aspida'
import { Deps, depend } from 'velona'
import { ServerMethods } from '../../$server'
import { AdditionalRequest as AdditionalRequest0 } from './hooks'
import { AdditionalRequest as AdditionalRequest1 } from './controller'
import { Methods } from './'

type AdditionalRequest = AdditionalRequest0 & AdditionalRequest1
type AddedHandler<T> = T extends (req: infer U, ...args: infer V) => infer W ? (req: U & Partial<AdditionalRequest>, ...args: V) => W : never
type Hooks = {
  onRequest?: AddedHandler<onRequestHookHandler> | AddedHandler<onRequestHookHandler>[]
  preParsing?: AddedHandler<preParsingHookHandler> | AddedHandler<preParsingHookHandler>[]
  preValidation?: AddedHandler<preValidationHookHandler> | AddedHandler<preValidationHookHandler>[]
  preHandler?: AddedHandler<preHandlerHookHandler> | AddedHandler<preHandlerHookHandler>[]
}
type ControllerMethods = ServerMethods<Methods, AdditionalRequest>

export function defineResponseSchema<T extends { [U in keyof ControllerMethods]?: { [V in HttpStatusOk]?: Schema }}>(methods: () => T) {
  return methods
}

export function defineHooks<T extends Hooks>(hooks: (fastify: FastifyInstance) => T): (fastify: FastifyInstance) => T
export function defineHooks<T extends Record<string, any>, U extends Hooks>(deps: T, cb: (d: Deps<T>, fastify: FastifyInstance) => U): { (fastify: FastifyInstance): U; inject(d: Deps<T>): (fastify: FastifyInstance) => U }
export function defineHooks<T extends Record<string, any>>(hooks: (fastify: FastifyInstance) => Hooks | T, cb?: (deps: Deps<T>, fastify: FastifyInstance) => Hooks) {
  return cb && typeof hooks !== 'function' ? depend(hooks, cb) : hooks
}

export function defineController(methods: (fastify: FastifyInstance) => ControllerMethods): (fastify: FastifyInstance) => ControllerMethods
export function defineController<T extends Record<string, any>>(deps: T, cb: (d: Deps<T>, fastify: FastifyInstance) => ControllerMethods): { (fastify: FastifyInstance): ControllerMethods; inject(d: Deps<T>): (fastify: FastifyInstance) => ControllerMethods }
export function defineController<T extends Record<string, any>>(methods: (fastify: FastifyInstance) => ControllerMethods | T, cb?: (deps: Deps<T>, fastify: FastifyInstance) => ControllerMethods) {
  return cb && typeof methods !== 'function' ? depend(methods, cb) : methods
}

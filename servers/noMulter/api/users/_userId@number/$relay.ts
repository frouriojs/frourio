/* eslint-disable */
import { FastifyInstance, onRequestHookHandler, preParsingHookHandler, preValidationHookHandler, preHandlerHookHandler } from 'fastify'
import { Deps, depend } from 'velona'
import { ServerMethods } from '../../../$server'
import { AdditionalRequest } from './../hooks'
import { Methods } from './'

type AddedHandler<T> = T extends (req: infer U, ...args: infer V) => infer W ? (req: U & Partial<AdditionalRequest>, ...args: V) => W : never
type Hooks = {
  onRequest?: AddedHandler<onRequestHookHandler> | AddedHandler<onRequestHookHandler>[]
  preParsing?: AddedHandler<preParsingHookHandler> | AddedHandler<preParsingHookHandler>[]
  preValidation?: AddedHandler<preValidationHookHandler> | AddedHandler<preValidationHookHandler>[]
  preHandler?: AddedHandler<preHandlerHookHandler> | AddedHandler<preHandlerHookHandler>[]
}
type ControllerMethods = ServerMethods<Methods, AdditionalRequest & {
  params: {
    userId: number
  }
}>

export function defineHooks<T extends Hooks>(hooks: (fastify: FastifyInstance) => T): (fastify: FastifyInstance) => T
export function defineHooks<T extends Record<string, any>, U extends Hooks>(deps: T, cb: (d: Deps<T>, fastify: FastifyInstance) => U): { (fastify: FastifyInstance): U; inject(d: Deps<T>): (fastify: FastifyInstance) => U }
export function defineHooks<T extends Record<string, any>>(hooks: (fastify: FastifyInstance) => Hooks | T, cb?: (deps: Deps<T>, fastify: FastifyInstance) => Hooks) {
  return cb && typeof hooks !== 'function' ? depend(hooks, cb) : hooks
}

export function defineController(methods: () => ControllerMethods): () => ControllerMethods
export function defineController<T extends Record<string, any>>(deps: T, cb: (d: Deps<T>) => ControllerMethods): { (): ControllerMethods; inject(d: Deps<T>): () => ControllerMethods }
export function defineController<T extends Record<string, any>>(methods: () => ControllerMethods | T, cb?: (deps: Deps<T>) => ControllerMethods) {
  return cb && typeof methods !== 'function' ? depend(methods, cb) : methods
}

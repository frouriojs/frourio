/* eslint-disable */
import { FastifyInstance, onRequestHookHandler, preParsingHookHandler, preValidationHookHandler, preHandlerHookHandler } from 'fastify'
import { Deps, depend } from 'velona'
import { ServerMethods } from '../../$server'
import { User } from './hooks'
import { Methods } from './'

type ControllerMethods = ServerMethods<Methods, {
  user: User
}>

export type Hooks = {
  onRequest?: onRequestHookHandler | onRequestHookHandler[]
  preParsing?: preParsingHookHandler | preParsingHookHandler[]
  preValidation?: preValidationHookHandler | preValidationHookHandler[]
  preHandler?: preHandlerHookHandler | preHandlerHookHandler[]
}

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

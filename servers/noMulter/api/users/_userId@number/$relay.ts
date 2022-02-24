/* eslint-disable */
// prettier-ignore
import type { Injectable } from 'velona'
// prettier-ignore
import { depend } from 'velona'
// prettier-ignore
import type { FastifyInstance, onRequestHookHandler, preParsingHookHandler, preValidationHookHandler, preHandlerHookHandler } from 'fastify'
// prettier-ignore
import type { Schema } from 'fast-json-stringify'
// prettier-ignore
import type { HttpStatusOk } from 'aspida'
// prettier-ignore
import type { ServerMethods } from '../../../$server'
// prettier-ignore
import type { AdditionalRequest } from './../hooks'
// prettier-ignore
import type { Methods } from './'

// prettier-ignore
type AddedHandler<T> = T extends (req: infer U, ...args: infer V) => infer W ? (req: U & Partial<AdditionalRequest>, ...args: V) => W : never
// prettier-ignore
type Hooks = {
  onRequest?: AddedHandler<onRequestHookHandler> | AddedHandler<onRequestHookHandler>[]
  preParsing?: AddedHandler<preParsingHookHandler> | AddedHandler<preParsingHookHandler>[]
  preValidation?: AddedHandler<preValidationHookHandler> | AddedHandler<preValidationHookHandler>[]
  preHandler?: AddedHandler<preHandlerHookHandler> | AddedHandler<preHandlerHookHandler>[]
}
// prettier-ignore
type ControllerMethods = ServerMethods<Methods, AdditionalRequest & {
  params: {
    userId: number
  }
}>

// prettier-ignore
export function defineResponseSchema<T extends { [U in keyof ControllerMethods]?: { [V in HttpStatusOk]?: Schema }}>(methods: () => T) {
  return methods
}

// prettier-ignore
export function defineHooks<T extends Hooks>(hooks: (fastify: FastifyInstance) => T): (fastify: FastifyInstance) => T
// prettier-ignore
export function defineHooks<T extends Record<string, any>, U extends Hooks>(deps: T, cb: (d: T, fastify: FastifyInstance) => U): Injectable<T, [FastifyInstance], U>
// prettier-ignore
export function defineHooks<T extends Record<string, any>>(hooks: (fastify: FastifyInstance) => Hooks | T, cb?: (deps: T, fastify: FastifyInstance) => Hooks) {
  return cb && typeof hooks !== 'function' ? depend(hooks, cb) : hooks
}

// prettier-ignore
export function defineController(methods: (fastify: FastifyInstance) => ControllerMethods): (fastify: FastifyInstance) => ControllerMethods
// prettier-ignore
export function defineController<T extends Record<string, any>>(deps: T, cb: (d: T, fastify: FastifyInstance) => ControllerMethods): Injectable<T, [FastifyInstance], ControllerMethods>
// prettier-ignore
export function defineController<T extends Record<string, any>>(methods: (fastify: FastifyInstance) => ControllerMethods | T, cb?: (deps: T, fastify: FastifyInstance) => ControllerMethods) {
  return cb && typeof methods !== 'function' ? depend(methods, cb) : methods
}

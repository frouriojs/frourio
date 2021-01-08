/* eslint-disable */
import { Injectable, depend } from 'velona'
import type { FastifyInstance, onRequestHookHandler, preParsingHookHandler, preValidationHookHandler, preHandlerHookHandler } from 'fastify'
import type { Schema } from 'fast-json-stringify'
import type { HttpStatusOk } from 'aspida'
import type { ServerMethods } from '../../../$server'
import type { Methods } from './'

type Hooks = {
  onRequest?: onRequestHookHandler | onRequestHookHandler[]
  preParsing?: preParsingHookHandler | preParsingHookHandler[]
  preValidation?: preValidationHookHandler | preValidationHookHandler[]
  preHandler?: preHandlerHookHandler | preHandlerHookHandler[]
}
type ControllerMethods = ServerMethods<Methods, {
  params: {
    label: string
  }
}>

export function defineResponseSchema<T extends { [U in keyof ControllerMethods]?: { [V in HttpStatusOk]?: Schema }}>(methods: () => T) {
  return methods
}

export function defineHooks<T extends Hooks>(hooks: (fastify: FastifyInstance) => T): (fastify: FastifyInstance) => T
export function defineHooks<T extends Record<string, any>, U extends Hooks>(deps: T, cb: (d: T, fastify: FastifyInstance) => U): Injectable<T, [FastifyInstance], U>
export function defineHooks<T extends Record<string, any>>(hooks: (fastify: FastifyInstance) => Hooks | T, cb?: (deps: T, fastify: FastifyInstance) => Hooks) {
  return cb && typeof hooks !== 'function' ? depend(hooks, cb) : hooks
}

export function defineController(methods: (fastify: FastifyInstance) => ControllerMethods): (fastify: FastifyInstance) => ControllerMethods
export function defineController<T extends Record<string, any>>(deps: T, cb: (d: T, fastify: FastifyInstance) => ControllerMethods): Injectable<T, [FastifyInstance], ControllerMethods>
export function defineController<T extends Record<string, any>>(methods: (fastify: FastifyInstance) => ControllerMethods | T, cb?: (deps: T, fastify: FastifyInstance) => ControllerMethods) {
  return cb && typeof methods !== 'function' ? depend(methods, cb) : methods
}

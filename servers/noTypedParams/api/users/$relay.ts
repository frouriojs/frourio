import type { Injectable } from 'velona'
import { depend } from 'velona'
import type { FastifyInstance } from 'fastify'
import type { Schema } from 'fast-json-stringify'
import type { HttpStatusOk } from 'aspida'
import type { ServerHooks, ServerMethodHandler } from '../../$server'
import type { AdditionalRequest } from './hooks'
import type { Methods } from './'

export function defineResponseSchema<T extends { [U in keyof Methods]?: { [V in HttpStatusOk]?: Schema }}>(methods: () => T) {
  return methods
}

export function defineHooks<T extends ServerHooks<AdditionalRequest>>(hooks: (fastify: FastifyInstance) => T): (fastify: FastifyInstance) => T
export function defineHooks<T extends Record<string, unknown>, U extends ServerHooks<AdditionalRequest>>(deps: T, cb: (d: T, fastify: FastifyInstance) => U): Injectable<T, [FastifyInstance], U>
export function defineHooks<T extends Record<string, unknown>>(hooks: (fastify: FastifyInstance) => ServerHooks<AdditionalRequest> | T, cb?: ((deps: T, fastify: FastifyInstance) => ServerHooks<AdditionalRequest>)) {
  return cb && typeof hooks !== 'function' ? depend(hooks, cb) : hooks
}

type ServerMethods = {
  [Key in keyof Methods]: ServerMethodHandler<Methods[Key], AdditionalRequest>
}

export function defineController<M extends ServerMethods>(methods: (fastify: FastifyInstance) => M): (fastify: FastifyInstance) => M
export function defineController<M extends ServerMethods, T extends Record<string, unknown>>(deps: T, cb: (d: T, fastify: FastifyInstance) => M): Injectable<T, [FastifyInstance], M>
export function defineController<M extends ServerMethods, T extends Record<string, unknown>>(methods: ((fastify: FastifyInstance) => M) | T, cb?: ((deps: T, fastify: FastifyInstance) => M)) {
  return cb && typeof methods !== 'function' ? depend(methods, cb) : methods
}

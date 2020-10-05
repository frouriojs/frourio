/* eslint-disable */
import { Express, RequestHandler } from 'express'
import { Deps, depend } from 'velona'
import { ServerMethods } from '../../../$server'
import { User } from './../hooks'
import { Methods } from './'

type ControllerMethods = ServerMethods<Methods, {
  user: User
  params: {
    userId: number
  }
}>

export type Hooks = {
  onRequest?: RequestHandler | RequestHandler[]
  preParsing?: RequestHandler | RequestHandler[]
  preValidation?: RequestHandler | RequestHandler[]
  preHandler?: RequestHandler | RequestHandler[]
}

export function defineHooks<T extends Hooks>(hooks: (app: Express) => T): (app: Express) => T
export function defineHooks<T extends Record<string, any>, U extends Hooks>(deps: T, cb: (d: Deps<T>, app: Express) => U): { (app: Express): U; inject(d: Deps<T>): (app: Express) => U }
export function defineHooks<T extends Record<string, any>>(hooks: (app: Express) => Hooks | T, cb?: (deps: Deps<T>, app: Express) => Hooks) {
  return cb && typeof hooks !== 'function' ? depend(hooks, cb) : hooks
}

export function defineController(methods: () => ControllerMethods): () => ControllerMethods
export function defineController<T extends Record<string, any>>(deps: T, cb: (d: Deps<T>) => ControllerMethods): { (): ControllerMethods; inject(d: Deps<T>): () => ControllerMethods }
export function defineController<T extends Record<string, any>>(methods: () => ControllerMethods | T, cb?: (deps: Deps<T>) => ControllerMethods) {
  return cb && typeof methods !== 'function' ? depend(methods, cb) : methods
}

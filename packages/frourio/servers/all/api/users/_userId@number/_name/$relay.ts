/* eslint-disable */
import { RequestHandler } from 'express'
import { Deps } from 'velona'
import { ServerMethods } from '../../../../$server'
import { User } from './../../hooks'
import { Methods } from './'

type ControllerMethods = ServerMethods<Methods, {
  user: User
  params: {
    userId: number
    name: string
  }
}>

export type Hooks = {
  onRequest?: RequestHandler | RequestHandler[]
  preParsing?: RequestHandler | RequestHandler[]
  preValidation?: RequestHandler | RequestHandler[]
  preHandler?: RequestHandler | RequestHandler[]
}

export function defineHooks<T extends Hooks>(hooks: () => T): T
export function defineHooks<T extends Hooks, U extends Record<string, any>>(deps: U, cb: (deps: Deps<U>) => T): T & { inject: (d: Deps<U>) => T }
export function defineHooks<T extends Hooks, U extends Record<string, any>>(hooks: () => T | U, cb?: (deps: Deps<U>) => T) {
  return typeof hooks === 'function' ? hooks() : { ...cb!(hooks), inject: (d: Deps<U>) => cb!(d) }
}

export function defineController(methods: () => ControllerMethods): ControllerMethods
export function defineController<T extends Record<string, any>>(deps: T, cb: (deps: Deps<T>) => ControllerMethods): ControllerMethods & { inject: (d: Deps<T>) => ControllerMethods }
export function defineController<T extends Record<string, any>>(methods: () => ControllerMethods | T, cb?: (deps: Deps<T>) => ControllerMethods) {
  return typeof methods === 'function' ? methods() : { ...cb!(methods), inject: (d: Deps<T>) => cb!(d) }
}

/* eslint-disable */
import { ServerMethods, Deps, createMiddleware } from 'frourio'
import { User } from './@middleware'
import { Methods } from './'

type ControllerMethods = ServerMethods<Methods, {
  user: User
}>

export { createMiddleware }

export function createController(methods: () => ControllerMethods): ControllerMethods
export function createController<T extends Record<string, any>>(deps: T, cb: (deps: Deps<T>) => ControllerMethods): ControllerMethods & {  _frourio: boolean; inject: (d: Deps<T>) => ControllerMethods }
export function createController<T extends Record<string, any>>(methods: () => ControllerMethods | T, cb?: (deps: Deps<T>) => ControllerMethods) {
  return typeof methods === 'function' ? methods() : { ...cb!(methods), _frourio: true, inject: (d: Deps<T>) => cb!(d) }
}

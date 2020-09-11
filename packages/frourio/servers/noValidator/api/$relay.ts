/* eslint-disable */
import { Deps } from 'velona'
import { ServerMethods, defineHooks } from '../$app'
import { Methods } from './'

type ControllerMethods = ServerMethods<Methods, {}>

export { defineHooks }

export function defineController(methods: () => ControllerMethods): ControllerMethods
export function defineController<T extends Record<string, any>>(deps: T, cb: (deps: Deps<T>) => ControllerMethods): ControllerMethods & { inject: (d: Deps<T>) => ControllerMethods }
export function defineController<T extends Record<string, any>>(methods: () => ControllerMethods | T, cb?: (deps: Deps<T>) => ControllerMethods) {
  return typeof methods === 'function' ? methods() : { ...cb!(methods), inject: (d: Deps<T>) => cb!(d) }
}

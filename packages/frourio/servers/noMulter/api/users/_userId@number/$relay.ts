/* eslint-disable */
import { Deps } from 'velona'
import { ServerMethods, createHooks } from '../../../$app'
import { User } from './../hooks'
import { Methods } from './'

type ControllerMethods = ServerMethods<Methods, {
  user: User
  params: {
    userId: number
  }
}>

export { createHooks }

export function createController(methods: () => ControllerMethods): ControllerMethods
export function createController<T extends Record<string, any>>(deps: T, cb: (deps: Deps<T>) => ControllerMethods): ControllerMethods & { inject: (d: Deps<T>) => ControllerMethods }
export function createController<T extends Record<string, any>>(methods: () => ControllerMethods | T, cb?: (deps: Deps<T>) => ControllerMethods) {
  return typeof methods === 'function' ? methods() : { ...cb!(methods), inject: (d: Deps<T>) => cb!(d) }
}

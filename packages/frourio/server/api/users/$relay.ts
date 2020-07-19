/* eslint-disable */
import { RequestHandler } from 'express'
import { ServerMethods } from 'frourio'
import { User } from './@middleware'
import { Methods } from './'

type ControllerMethods = ServerMethods<Methods, {
  user: User
}>

export const createMiddleware = <
  T extends RequestHandler | [] | [RequestHandler, ...RequestHandler[]]
>(handler: T): T => handler

export const createController = (methods: ControllerMethods) => methods

export const createInjectableController = <T>(
  cb: (deps: T) => ControllerMethods,
  deps: T
) => ({ ...cb(deps), inject: (d: T) => cb(d) })

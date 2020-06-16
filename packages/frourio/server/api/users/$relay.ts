/* eslint-disable */
import { RequestHandler } from 'express'
import { ServerMethods } from 'frourio'
import { User } from './@middleware'
import { Methods } from './'

type Types = {
  user: User
}

export const createMiddleware = (middleware: RequestHandler | RequestHandler[]) => middleware
export const createController = (methods: ServerMethods<Methods, Types>) => methods

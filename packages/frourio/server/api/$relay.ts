/* eslint-disable */
import { RequestHandler } from 'express'
import { ServerMethods } from 'frourio'
import { Methods } from './'

type Types = {}

export const createMiddleware = (middleware: RequestHandler | RequestHandler[]) => middleware
export const createController = (methods: ServerMethods<Methods, Types>) => methods

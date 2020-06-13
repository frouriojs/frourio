/* eslint-disable */
import 'reflect-metadata'
import { tmpdir } from 'os'
import { Server } from 'http'
import path from 'path'
import express, { Express } from 'express'
import multer from 'multer'
import helmet from 'helmet'
import cors from 'cors'
import { createConnection, Connection } from 'typeorm'
import { createRouter, Config } from 'frourio'
import { Task as Entity0 } from './entity/Task'
import { TaskSubscriber as Subscriber0 } from './subscriber/TaskSubscriber'
import * as Types from './types'
import controller0, { middleware as ctrlMiddleware0 } from './api/@controller'
import controller1 from './api/texts/@controller'
import controller2 from './api/texts/sample/@controller'
import controller3, { middleware as ctrlMiddleware1 } from './api/users/@controller'
import controller4 from './api/users/_userId@number/@controller'
import middleware0 from './api/@middleware'
import middleware1 from './api/users/@middleware'

export const controllers = {
  name: '/',
  validator: {
    get: {
      query: { required: false, Class: Types.ValidQuery }
    },
    post: {
      query: { required: true, Class: Types.ValidQuery },
      body: { required: true, Class: Types.ValidBody }
    }
  },
  uploader: ['post'],
  controller: controller0,
  ctrlMiddleware: ctrlMiddleware0,
  middleware: middleware0,
  children: {
    names: [
      {
        name: '/texts',
        controller: controller1,
        children: {
          names: [
            {
              name: '/sample',
              controller: controller2
            }
          ]
        }
      },
      {
        name: '/users',
        validator: {
          post: {
            body: { required: true, Class: Types.ValidUserInfo }
          }
        },
        controller: controller3,
        ctrlMiddleware: ctrlMiddleware1,
        middleware: middleware1,
        children: {
          value: {
            name: '/_userId@number',
            controller: controller4
          }
        }
      }
    ]
  }
}

export const entities = [Entity0]
export const migrations = []
export const subscribers = [Subscriber0]
export const run = async (config: Config) => {
  const app = express()
  const router = createRouter(
    controllers,
    multer(config.multer ?? { dest: tmpdir(), limits: { fileSize: 1024 ** 3 } }).any()
  )

  if (config.helmet) app.use(helmet(config.helmet === true ? {} : config.helmet))
  if (config.cors) app.use(cors(config.cors === true ? {} : config.cors))

  app.use((req, res, next) => {
    express.json()(req, res, err => {
      if (err) return res.sendStatus(400)

      next()
    })
  })

  if (config.basePath && config.basePath !== '/') {
    app.use(config.basePath.startsWith('/') ? config.basePath : `/${config.basePath}`, router)
  } else {
    app.use(router)
  }

  app.use(express.static(path.join(__dirname, 'public')))

  let connection: Connection

  if (config.typeorm) {
    connection = await createConnection({
      entities,
      migrations,
      subscribers,
      ...config.typeorm
    })
  }

  return new Promise<{
    app: Express
    server: Server
    connection?: Connection
  }>(resolve => {
    const server = app.listen(config.port, () => {
      console.log(`Frourio is running on http://localhost:${config.port}`)
      resolve({ app, server, connection })
    })
  })
}

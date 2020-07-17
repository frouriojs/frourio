/* eslint-disable */
import 'reflect-metadata'
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
import controller1 from './api/multiForm/@controller'
import controller2 from './api/texts/@controller'
import controller3 from './api/texts/sample/@controller'
import controller4, { middleware as ctrlMiddleware1 } from './api/users/@controller'
import controller5 from './api/users/_userId@number/@controller'
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
        name: '/multiForm',
        validator: {
          post: {
            body: { required: true, Class: Types.ValidMultiForm }
          }
        },
        uploader: ['post'],
        controller: controller1
      },
      {
        name: '/texts',
        controller: controller2,
        children: {
          names: [
            {
              name: '/sample',
              controller: controller3
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
        controller: controller4,
        ctrlMiddleware: ctrlMiddleware1,
        middleware: middleware1,
        children: {
          value: {
            name: '/_userId@number',
            controller: controller5
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
    multer(
      config.multer ?? { dest: path.join(__dirname, '.upload'), limits: { fileSize: 1024 ** 3 } }
    ).any()
  )

  if (config.helmet) app.use(helmet(config.helmet === true ? {} : config.helmet))
  if (config.cors) app.use(cors(config.cors === true ? {} : config.cors))

  app.use((req, res, next) => {
    express.json()(req, res, err => {
      if (err) return res.sendStatus(400)

      next()
    })
  })

  const staticMiddleware = express.static(path.join(__dirname, 'public'))
  if (config.basePath && config.basePath !== '/') {
    const staticPath = config.basePath.startsWith('/') ? config.basePath : `/${config.basePath}`
    app.use(staticPath, router)
    app.use(staticPath, staticMiddleware)
  } else {
    app.use(router)
    app.use(staticMiddleware)
  }

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

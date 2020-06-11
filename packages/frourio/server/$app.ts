/* eslint-disable */
import { tmpdir } from 'os'
import { Server } from 'http'
import express from 'express'
import multer from 'multer'
import helmet from 'helmet'
import cors from 'cors'
import { createRouter } from 'frourio'
import config from './frourio.config'
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

export const router = createRouter(
  controllers,
  multer({
    dest: config.uploader?.dest ?? tmpdir(),
    limits: { fileSize: config.uploader?.size ?? 1024 ** 3 }
  }).any()
)

export const app = express()

if (config.helmet) app.use(helmet())
if (config.cors) app.use(cors())

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

if (config.staticDir) {
  ;(Array.isArray(config.staticDir) ? config.staticDir : [config.staticDir]).forEach(dir =>
    app.use(express.static(dir))
  )
}

export const run = (port: number | string = config.port ?? 8080) =>
  new Promise<Server>(resolve => {
    const server = app.listen(port, () => {
      console.log(`Frourio is running on http://localhost:${port}`)
      resolve(server)
    })
  })

/* eslint-disable */
import { tmpdir } from 'os'
import { Server } from 'http'
import express from 'express'
import multer from 'multer'
import helmet from 'helmet'
import cors from 'cors'
import dotenv from 'dotenv'
import { createRouter } from 'frourio'
import controllers from './$controllers'

dotenv.config()

export const router = createRouter(
  controllers,
  multer({ dest: tmpdir(), limits: { fileSize: 1024 ** 3 } }).any()
)

export const app = express()
  .use(helmet())
  .use(cors())
  .use((req, res, next) => {
    express.json()(req, res, err => {
      if (err) return res.sendStatus(400)

      next()
    })
  })
  .use('/api', router)
  .use(express.static('packages/frourio/public'))

export const run = (port: number | string = 10000) =>
  new Promise<Server>(resolve => {
    const server = app.listen(port, () => {
      console.log(`Frourio is running on http://localhost:${port}`)
      resolve(server)
    })
  })

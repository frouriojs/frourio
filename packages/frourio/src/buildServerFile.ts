import path from 'path'
import { Template } from 'aspida/dist/buildTemplate'
import createControllersText from './createControllersText'

export default (input: string): Template => ({
  text: `/* eslint-disable */
import { tmpdir } from 'os'
import { Server } from 'http'
import express from 'express'
import multer from 'multer'
import helmet from 'helmet'
import cors from 'cors'
import { createRouter } from 'frourio'
import config from './frourio.config'
${createControllersText(`${input}/api`)}

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
  app.use(config.basePath.startsWith('/') ? config.basePath : \`/\${config.basePath}\`, router)
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
      console.log(\`Frourio is running on http://localhost:\${port}\`)
      resolve(server)
    })
  })
`,
  filePath: path.posix.join(input, '$app.ts')
})

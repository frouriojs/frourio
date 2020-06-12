import path from 'path'
import { Template } from 'aspida/dist/buildTemplate'
import createControllersText from './createControllersText'
import createTypeormText from './createTypeormText'

export default (input: string): Template => {
  const typeormText = createTypeormText(input)

  return {
    text: `/* eslint-disable */
import 'reflect-metadata'
import { tmpdir } from 'os'
import { Server } from 'http'
import express, { Express } from 'express'
import multer from 'multer'
import helmet from 'helmet'
import cors from 'cors'
import { createConnection, Connection } from 'typeorm'
import { createRouter, Config } from 'frourio'${typeormText.imports}
${createControllersText(`${input}/api`)}

export const entities = [${typeormText.entities}]
export const migrations = [${typeormText.migrations}]
export const subscribers = [${typeormText.subscribers}]
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
    app.use(config.basePath.startsWith('/') ? config.basePath : \`/\${config.basePath}\`, router)
  } else {
    app.use(router)
  }

  if (config.staticDir) {
    ;(Array.isArray(config.staticDir) ? config.staticDir : [config.staticDir]).forEach(dir =>
      app.use(express.static(dir))
    )
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
      console.log(\`Frourio is running on http://localhost:\${config.port}\`)
      resolve({ app, server, connection })
    })
  })
}
`,
    filePath: path.posix.join(input, '$app.ts')
  }
}

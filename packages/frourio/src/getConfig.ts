import fs from 'fs'
import path from 'path'

export type Config = {
  input: string
  port: number
  basePath: string
  staticDir?: string[]
  helmet: boolean
  cors: boolean
  immediate: boolean
  uploader: {
    dest?: string
    size?: number
  }
}

type ConfigFile = {
  input?: string
  port?: number
  basePath?: string
  staticDir?: string | string[]
  helmet?: boolean
  cors?: boolean
  immediate?: boolean
  uploader?: {
    dest?: string
    size?: number
  }
}

const createConfig = (config: ConfigFile = {}): Config => ({
  input: config.input ?? 'apis',
  port: config.port ?? 8080,
  basePath: config.basePath ?? '/',
  staticDir: typeof config.staticDir === 'string' ? [config.staticDir] : config.staticDir,
  helmet: config.helmet ?? true,
  cors: config.cors ?? false,
  immediate: config.immediate ?? true,
  uploader: config.uploader ?? {}
})

export default (configPath = 'frourio.config.js'): Config[] => {
  if (!fs.existsSync(configPath)) return [createConfig()]

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config: ConfigFile | ConfigFile[] = require(path.join(process.cwd(), configPath))

  return Array.isArray(config) ? config.map(createConfig) : [createConfig(config)]
}

import getBaseConfig, { BaseConfig } from 'aspida/dist/getConfig'

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

type ConfigFile = BaseConfig & {
  server?: {
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
}

const createConfig = (config: ConfigFile) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const server = config.server!

  return {
    input: config.input,
    port: server.port ?? 8080,
    basePath: server.basePath || '/',
    staticDir: typeof server.staticDir === 'string' ? [server.staticDir] : server.staticDir,
    helmet: server.helmet ?? true,
    cors: server.cors ?? false,
    immediate: server.immediate ?? true,
    uploader: server.uploader ?? {}
  }
}

export default (configPath?: string): Config[] =>
  getBaseConfig(configPath)
    .filter((c: ConfigFile) => c.server)
    .map(c => createConfig(c))

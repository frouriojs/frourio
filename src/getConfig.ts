import fs from 'fs'
import path from 'path'

export type Config = {
  input: string
  output: string
}

type ConfigFile = {
  input?: string
  output?: string
}

const defaultConfig: Config = {
  input: '',
  output: ''
}

export default (configPath = 'pathpida.config.js'): Config[] => {
  if (fs.existsSync(configPath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config: ConfigFile | ConfigFile[] = require(path.join(process.cwd(), configPath))

    return Array.isArray(config)
      ? config.map(c => ({ ...defaultConfig, ...c }))
      : [{ ...defaultConfig, ...config }]
  }

  return [{ ...defaultConfig }]
}

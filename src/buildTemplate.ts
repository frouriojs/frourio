import path from 'path'
import { Config } from './getConfig'

export type Template = {
  text: string
  filePath: string
}

export default ({ output }: Config): Template => {
  const text = '/* eslint-disable */'

  return { text, filePath: path.posix.join(output, '$template.ts') }
}

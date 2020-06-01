import fs from 'fs'
import path from 'path'

export default (dir: string, hasValuesFile: boolean) => {
  const indexFilePath = path.join(dir, 'index.ts')
  if (!fs.existsSync(indexFilePath)) {
    fs.writeFileSync(indexFilePath, 'export type Methods = {}\n', 'utf8')
  }

  const controllerFilePath = path.join(dir, '@controller.ts')
  if (!fs.existsSync(controllerFilePath)) {
    fs.writeFileSync(
      controllerFilePath,
      `import { createController } from 'frourio'
${hasValuesFile ? "import { Values } from './$values'\n" : ''}import { Methods } from './'\n
export default createController<Methods${hasValuesFile ? ', Values' : ''}>({})\n`,
      'utf8'
    )
  }
}

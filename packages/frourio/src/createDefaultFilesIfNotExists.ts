import fs from 'fs'
import path from 'path'

export default (dir: string, hasValuesFile: boolean) => {
  const indexFilePath = path.join(dir, 'index.ts')
  if (!fs.existsSync(indexFilePath)) {
    fs.writeFileSync(indexFilePath, 'export type Methods = {\n\n}\n', 'utf8')
  }

  const controllerFilePath = path.join(dir, '@controller.ts')
  if (!fs.existsSync(controllerFilePath)) {
    fs.writeFileSync(
      controllerFilePath,
      `import { createController, createMiddleware } from 'frourio'
import { Methods } from './'${hasValuesFile ? "\nimport { Values } from './$values'" : ''}

export default createController<Methods${hasValuesFile ? ', Values' : ''}>({\n\n})\n`,
      'utf8'
    )
  }
}

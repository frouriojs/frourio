import fs from 'fs'
import path from 'path'

export default async (dir: string) => {
  const indexFilePath = path.join(dir, 'index.ts')
  if (!fs.existsSync(indexFilePath)) {
    fs.promises.writeFile(indexFilePath, 'export type Methods = {}\n', 'utf8')
  }

  const controllerFilePath = path.join(dir, '@controller.ts')
  if (!fs.existsSync(controllerFilePath)) {
    fs.promises.writeFile(
      controllerFilePath,
      "import { createController } from './$relay'\n\nexport default createController(() => ({}))\n",
      'utf8'
    )
  }

  const middlewareFilePath = path.join(dir, '@middleware.ts')
  if (
    fs.existsSync(middlewareFilePath) &&
    !(await fs.promises.readFile(middlewareFilePath, 'utf8'))
  ) {
    fs.promises.writeFile(
      middlewareFilePath,
      "import { createMiddleware } from './$relay'\n\nexport default createMiddleware([])\n",
      'utf8'
    )
  }
}

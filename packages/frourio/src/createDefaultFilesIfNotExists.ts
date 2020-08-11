import fs from 'fs'
import path from 'path'

export default (dir: string) => {
  const indexFilePath = path.join(dir, 'index.ts')

  if (!fs.existsSync(indexFilePath)) {
    fs.writeFileSync(
      indexFilePath,
      `export type Methods = {
  get: {
    resBody: string
  }
}
`,
      'utf8'
    )
  }

  const controllerFilePath = path.join(dir, '@controller.ts')

  if (!fs.existsSync(controllerFilePath)) {
    fs.writeFileSync(
      controllerFilePath,
      `import { createController } from './$relay'

export default createController(() => ({
  get: () => ({ status: 200, body: 'Hello' })
}))
`,
      'utf8'
    )
  }

  const middlewareFilePath = path.join(dir, '@middleware.ts')

  if (fs.existsSync(middlewareFilePath) && !fs.readFileSync(middlewareFilePath, 'utf8')) {
    fs.writeFileSync(
      middlewareFilePath,
      "import { createMiddleware } from './$relay'\n\nexport default createMiddleware([])\n",
      'utf8'
    )
  }
}

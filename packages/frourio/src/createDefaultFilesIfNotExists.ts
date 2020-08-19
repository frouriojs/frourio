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

  const controllerFilePath = path.join(dir, 'controller.ts')

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

  const hooksFilePath = path.join(dir, 'hooks.ts')

  if (fs.existsSync(hooksFilePath) && !fs.readFileSync(hooksFilePath, 'utf8')) {
    fs.writeFileSync(
      hooksFilePath,
      `import { createHooks } from './$relay'

export default createHooks(() => ({
  onRequest: (req, res, next) => {
    console.log('Directory level onRequest hook:', req.path)
    next()
  }
}))
`,
      'utf8'
    )
  }
}

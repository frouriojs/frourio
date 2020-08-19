import fs from 'fs'
import createDefaultFilesIfNotExists from '../src/createDefaultFilesIfNotExists'

test('createDefaultFilesIfNotExists', () => {
  const dir = 'tmp'
  fs.mkdirSync(dir)
  createDefaultFilesIfNotExists(dir)

  expect(fs.readFileSync(`${dir}/index.ts`, 'utf8')).toBe(`export type Methods = {
  get: {
    resBody: string
  }
}
`)

  expect(fs.readFileSync(`${dir}/controller.ts`, 'utf8'))
    .toBe(`import { createController } from './$relay'

export default createController(() => ({
  get: () => ({ status: 200, body: 'Hello' })
}))
`)

  expect(fs.existsSync(`${dir}/hooks.ts`)).toBeFalsy()

  fs.writeFileSync(`${dir}/hooks.ts`, '', 'utf8')
  createDefaultFilesIfNotExists(dir)

  expect(fs.readFileSync(`${dir}/hooks.ts`, 'utf8')).toBe(
    `import { createHooks } from './$relay'

export default createHooks(() => ({
  onRequest: (req, res, next) => {
    console.log('Directory level onRequest hook:', req.path)
    next()
  }
}))
`
  )

  fs.rmdirSync(dir, { recursive: true })
})

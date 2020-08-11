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

  expect(fs.readFileSync(`${dir}/@controller.ts`, 'utf8'))
    .toBe(`import { createController } from './$relay'

export default createController(() => ({
  get: () => ({ status: 200, body: 'Hello' })
}))
`)

  expect(fs.existsSync(`${dir}/@middleware.ts`)).toBeFalsy()

  fs.writeFileSync(`${dir}/@middleware.ts`, '', 'utf8')
  createDefaultFilesIfNotExists(dir)

  expect(fs.readFileSync(`${dir}/@middleware.ts`, 'utf8')).toBe(
    "import { createMiddleware } from './$relay'\n\nexport default createMiddleware([])\n"
  )

  fs.rmdirSync(dir, { recursive: true })
})

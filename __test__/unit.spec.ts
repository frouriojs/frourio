import fs from 'fs'
import rimraf from 'rimraf'
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
    .toBe(`import { defineController } from './$relay'

export default defineController(() => ({
  get: () => ({ status: 200, body: 'Hello' })
}))
`)

  expect(fs.existsSync(`${dir}/hooks.ts`)).toBeFalsy()

  fs.writeFileSync(`${dir}/hooks.ts`, '', 'utf8')
  createDefaultFilesIfNotExists(dir)

  expect(fs.readFileSync(`${dir}/hooks.ts`, 'utf8')).toBe(
    `import { defineHooks } from './$relay'

export default defineHooks(() => ({
  onRequest: (req, reply, done) => {
    console.log('Directory level onRequest hook:', req.url)
    done()
  }
}))
`
  )
  rimraf.sync(dir)

  fs.mkdirSync(dir)
  fs.writeFileSync(`${dir}/$test.ts`, '// test file')
  createDefaultFilesIfNotExists(dir)
  expect(fs.readdirSync(dir)).toEqual(['$test.ts'])

  rimraf.sync(dir)
})

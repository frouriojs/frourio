import fs from 'fs'
import build from '../src/buildServerFile'
import aspidaBuild from 'aspida/dist/buildTemplate'

const basePath = 'packages/frourio'

test('build', () => {
  const inputDir = `${basePath}/server`

  const result = build(inputDir)
  expect(result.text.replace(inputDir, 'server')).toBe(fs.readFileSync(result.filePath, 'utf8'))

  const [target] = aspidaBuild({
    input: `${inputDir}/api`,
    baseURL: '',
    trailingSlash: false,
    outputEachDir: false
  })
  expect(target.text).toBe(fs.readFileSync(target.filePath, 'utf8'))
})

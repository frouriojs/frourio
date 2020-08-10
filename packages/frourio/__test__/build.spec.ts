import fs from 'fs'
import { version } from '../package.json'
import { run } from '../src/cli'
import build from '../src/buildServerFile'
import aspidaBuild from 'aspida/dist/buildTemplate'

const basePath = 'packages/frourio'

test('version command', () => {
  const spyLog = jest.spyOn(console, 'log')
  const args = ['--version']

  run(args)
  expect(console.log).toHaveBeenCalledWith(`v${version}`)

  spyLog.mockRestore()
})

test('build', () => {
  const inputDir = `${basePath}/servers/all`

  const result = build(inputDir)
  expect(result.text.replace(inputDir, 'server/all')).toBe(
    fs.readFileSync(result.filePath, 'utf8').replace(/\r/g, '')
  )

  const [target] = aspidaBuild({
    input: `${inputDir}/api`,
    baseURL: '',
    trailingSlash: false,
    outputEachDir: false
  })
  expect(target.text).toBe(fs.readFileSync(target.filePath, 'utf8').replace(/\r/g, ''))
})

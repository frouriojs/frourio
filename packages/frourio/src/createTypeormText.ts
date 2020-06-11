import fs from 'fs'
import path from 'path'
import listFiles from './listFiles'

export default (inputDir: string) => {
  const entities = fs.existsSync(`${inputDir}/entity`) ? listFiles(`${inputDir}/entity`) : []
  const subscribers = fs.existsSync(`${inputDir}/subscriber`)
    ? listFiles(`${inputDir}/subscriber`)
    : []

  const imports = `${entities
    .map(
      (e, i) =>
        `import { ${path.basename(e, path.extname(e))} as Entity${i} } from '${e
          .replace(inputDir, '.')
          .replace('.ts', '')}'`
    )
    .join('\n')}${entities.length && subscribers.length ? '\n' : ''}${subscribers
    .map(
      (s, i) =>
        `import { ${path.basename(s, path.extname(s))} as Subscriber${i} } from '${s
          .replace(inputDir, '.')
          .replace('.ts', '')}'`
    )
    .join('\n')}`

  return {
    imports,
    entities: `[${entities.map((_, i) => `Entity${i}`).join(', ')}]`,
    subscribers: `[${subscribers.map((_, i) => `Subscriber${i}`).join(', ')}]`
  }
}

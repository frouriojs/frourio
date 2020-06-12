import fs from 'fs'
import path from 'path'
import listFiles from './listFiles'

export default (inputDir: string) => {
  const entities = fs.existsSync(`${inputDir}/entity`) ? listFiles(`${inputDir}/entity`) : []
  const migrations = fs.existsSync(`${inputDir}/migration`)
    ? listFiles(`${inputDir}/migration`)
    : []
  const subscribers = fs.existsSync(`${inputDir}/subscriber`)
    ? listFiles(`${inputDir}/subscriber`)
    : []

  const imports = `${entities
    .map(
      (e, i) =>
        `\nimport { ${path.basename(e, path.extname(e))} as Entity${i} } from '${e
          .replace(inputDir, '.')
          .replace('.ts', '')}'`
    )
    .join('')}${migrations
    .map((m, i) => {
      const names = path.basename(m, path.extname(m)).split('-')
      return `\nimport { ${names[1]}${names[0]} as Migration${i} } from '${m
        .replace(inputDir, '.')
        .replace('.ts', '')}'`
    })
    .join('')}${subscribers
    .map(
      (s, i) =>
        `\nimport { ${path.basename(s, path.extname(s))} as Subscriber${i} } from '${s
          .replace(inputDir, '.')
          .replace('.ts', '')}'`
    )
    .join('')}`

  return {
    imports,
    entities: entities.map((_, i) => `Entity${i}`).join(', '),
    migrations: migrations.map((_, i) => `Migration${i}`).join(', '),
    subscribers: subscribers.map((_, i) => `Subscriber${i}`).join(', ')
  }
}

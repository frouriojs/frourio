import fs from 'fs'
import path from 'path'
import { listFiles } from './listFiles'

const getFileName = (name: string) => path.basename(name, path.extname(name))

export default (inputDir: string) => {
  const entities = fs.existsSync(`${inputDir}/entity`) ? listFiles(`${inputDir}/entity`) : []
  const migrations = fs.existsSync(`${inputDir}/migration`)
    ? listFiles(`${inputDir}/migration`)
    : []
  const subscribers = fs.existsSync(`${inputDir}/subscriber`)
    ? listFiles(`${inputDir}/subscriber`)
    : []

  entities.forEach(async e => {
    if (await fs.promises.readFile(e, 'utf8')) return

    await fs.promises.writeFile(
      e,
      `import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class ${getFileName(e)} {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 100 })
  name: string
}
`,
      'utf8'
    )
  })

  const imports = `${entities
    .map(
      (e, i) =>
        `\nimport { ${getFileName(e)} as Entity${i} } from '${e
          .replace(inputDir, '.')
          .replace('.ts', '')}'`
    )
    .join('')}${migrations
    .map((m, i) => {
      const names = getFileName(m).split('-')
      return `\nimport { ${names[1]}${names[0]} as Migration${i} } from '${m
        .replace(inputDir, '.')
        .replace('.ts', '')}'`
    })
    .join('')}${subscribers
    .map(
      (s, i) =>
        `\nimport { ${getFileName(s)} as Subscriber${i} } from '${s
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

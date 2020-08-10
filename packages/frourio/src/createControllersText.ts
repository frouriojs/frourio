import path from 'path'
import fs from 'fs'
import { parse } from 'aspida/dist/commands'
import createDefaultFiles from './createDefaultFilesIfNotExists'

export default (inputDir: string) => {
  const middlewares: string[] = []
  const controllers: [string, boolean][] = []
  let hasValidators = false

  const createText = (
    dirPath: string,
    middleware: string[],
    params: [string, string][],
    appPath = '$app',
    user = ''
  ) => {
    let result = `  {\n    path: '${`/${dirPath}`
      .replace(/\/_/g, '/:')
      .replace(/@.+?($|\/)/g, '')}'${
      dirPath.includes('@number')
        ? `,\n    numberTypeParams: ['${dirPath
            .split('/')
            .filter(p => p.includes('@number'))
            .map(p => p.split('@')[0].slice(1))
            .join("', '")}']`
        : ''
    }`
    const input = path.posix.join(inputDir, dirPath)
    const appText = `../${appPath}`
    const userPath =
      fs.existsSync(path.join(input, '@middleware.ts')) &&
      parse(fs.readFileSync(path.join(input, '@middleware.ts'), 'utf8'), 'User')
        ? './@middleware'
        : user
        ? `./.${user}`
        : ''

    const relayPath = path.join(input, '$relay.ts')
    const text = `/* eslint-disable */\nimport { Deps } from 'velona'\nimport { ServerMethods, createMiddleware } from '${appText}'\n${
      userPath ? `import { User } from '${userPath}'\n` : ''
    }import { Methods } from './'\n\ntype ControllerMethods = ServerMethods<Methods, {${
      userPath ? '\n  user: User\n' : ''
    }${!userPath && params.length ? '\n' : ''}${
      params.length
        ? `  params: {\n${params.map(v => `    ${v[0]}: ${v[1]}`).join('\n')}\n  }\n`
        : ''
    }}>

export { createMiddleware }

export function createController(methods: () => ControllerMethods): ControllerMethods
export function createController<T extends Record<string, any>>(deps: T, cb: (deps: Deps<T>) => ControllerMethods): ControllerMethods & { inject: (d: Deps<T>) => ControllerMethods }
export function createController<T extends Record<string, any>>(methods: () => ControllerMethods | T, cb?: (deps: Deps<T>) => ControllerMethods) {
  return typeof methods === 'function' ? methods() : { ...cb!(methods), inject: (d: Deps<T>) => cb!(d) }
}
`

    if (!fs.existsSync(relayPath) || fs.readFileSync(relayPath, 'utf8') !== text) {
      fs.writeFileSync(relayPath, text, 'utf8')
    }

    createDefaultFiles(input)

    const validatorPrefix = 'Valid'
    const methods = parse(fs.readFileSync(path.join(input, 'index.ts'), 'utf8'), 'Methods')
    if (methods) {
      const validateInfo = methods
        .map(m => {
          const props: [string, { value: string; hasQuestion: boolean }][] = []
          if (m.props.query?.value.startsWith(validatorPrefix)) {
            props.push(['query', m.props.query])
          }
          if (m.props.reqBody?.value.startsWith(validatorPrefix)) {
            props.push(['body', m.props.reqBody])
          }
          if (m.props.reqHeaders?.value.startsWith(validatorPrefix)) {
            props.push(['headers', m.props.reqHeaders])
          }
          return { method: m.name, props }
        })
        .filter(v => v.props.length)

      if (validateInfo.length) {
        hasValidators = true
        result += `,\n    validator: {\n${validateInfo
          .map(
            v =>
              `      ${v.method}: {\n${v.props
                .map(
                  p =>
                    `        ${p[0]}: { required: ${!p[1].hasQuestion}, Class: Types.${
                      p[1].value
                    } }`
                )
                .join(',\n')}\n      }`
          )
          .join(',\n')}\n    }`
      }

      const uploaders = methods
        .filter(m => m.props.reqFormat?.value === 'FormData')
        .map(m => m.name)
      if (uploaders.length) {
        result += `,\n    uploader: ['${uploaders.join("', '")}']`
      }
    }

    result += `,\n    controller: controller${controllers.length}`

    if (fs.existsSync(path.join(input, '@middleware.ts'))) {
      middleware.push(`...middleware${middlewares.length}`)
      middlewares.push(`${input}/@middleware`)
    }

    const ctrlText = fs.readFileSync(path.join(input, '@controller.ts'), 'utf8')
    const hasMiddleware = /export (const|{)(.*[ ,])?middleware[, }=]/.test(ctrlText)

    if (middleware.length || hasMiddleware) {
      const m = `${middleware.join(', ')}${middleware.length && hasMiddleware ? ', ' : ''}${
        hasMiddleware ? `...ctrlMiddleware${controllers.filter(c => c[1]).length}` : ''
      }`
      result += `,\n    middleware: ${m.includes(',') ? `[${m}]` : m.replace('...', '')}`
    }

    controllers.push([`${input}/@controller`, hasMiddleware])
    result += '\n  }'

    const childrenDirs = fs
      .readdirSync(input)
      .filter(d => fs.statSync(path.join(input, d)).isDirectory() && !d.startsWith('@'))

    if (childrenDirs.length) {
      const names = childrenDirs.filter(d => !d.startsWith('_'))
      if (names.length) {
        result += names
          .map(
            n =>
              `,\n${createText(path.posix.join(dirPath, n), middleware, params, appText, userPath)}`
          )
          .join('')
      }

      const value = childrenDirs.find(d => d.startsWith('_'))

      if (value) {
        result += `,\n${createText(
          path.posix.join(dirPath, value),
          middleware,
          [...params, [value.slice(1).split('@')[0], value.split('@')[1] ?? 'string']],
          appText,
          userPath
        )}`
      }
    }

    return result
  }

  const text = createText('', [], [])
  const ctrlMiddleware = controllers.filter(c => c[1])

  return `${hasValidators ? "import * as Types from './types'" : ''}${
    controllers.length ? '\n' : ''
  }${controllers
    .map(
      (ctrl, i) =>
        `import controller${i}${
          ctrl[1] ? `, { middleware as ctrlMiddleware${ctrlMiddleware.indexOf(ctrl)} }` : ''
        } from '${ctrl[0].replace(/^api/, './api').replace(inputDir, './api')}'`
    )
    .join('\n')}${middlewares.length ? '\n' : ''}${middlewares
    .map(
      (m, i) =>
        `import middleware${i} from '${m.replace(/^api/, './api').replace(inputDir, './api')}'`
    )
    .join('\n')}\n\nexport const controllers = [\n${text}\n]`
}

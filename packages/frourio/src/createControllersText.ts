import path from 'path'
import fs from 'fs'
import { parse } from 'aspida/dist/commands'
import createDefaultFiles from './createDefaultFilesIfNotExists'

export default (inputDir: string) => {
  const middlewares: string[] = []
  const controllers: [string, boolean][] = []
  let hasValidators = false

  const createText = (input: string, indent: string, params: [string, string][], user = '') => {
    let result = ''
    const userPath =
      fs.existsSync(path.join(input, '@middleware.ts')) &&
      parse(fs.readFileSync(path.join(input, '@middleware.ts'), 'utf8'), 'User')
        ? './@middleware'
        : user
        ? `./.${user}`
        : ''

    const relayPath = path.join(input, '$relay.ts')
    const text = `/* eslint-disable */\nimport { Deps } from 'velona'\nimport { ServerMethods, createMiddleware } from 'frourio'\n${
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
        result += `,\n${indent}validator: {\n${validateInfo
          .map(
            v =>
              `  ${indent}${v.method}: {\n${v.props
                .map(
                  p =>
                    `    ${indent}${p[0]}: { required: ${!p[1].hasQuestion}, Class: Types.${
                      p[1].value
                    } }`
                )
                .join(',\n')}\n  ${indent}}`
          )
          .join(',\n')}\n${indent}}`
      }

      const uploaders = methods
        .filter(m => m.props.reqFormat?.value === 'FormData')
        .map(m => m.name)
      if (uploaders.length) {
        result += `,\n${indent}uploader: ['${uploaders.join("', '")}']`
      }
    }

    result += `,\n${indent}controller: controller${controllers.length}`
    const ctrlText = fs.readFileSync(path.join(input, '@controller.ts'), 'utf8')
    const hasMiddleware = /export (const|{)(.*[ ,])?middleware[, }=]/.test(ctrlText)

    if (hasMiddleware) {
      result += `,\n${indent}ctrlMiddleware: ctrlMiddleware${controllers.filter(c => c[1]).length}`
    }

    controllers.push([`${input}/@controller`, hasMiddleware])

    if (fs.existsSync(path.join(input, '@middleware.ts'))) {
      result += `,\n${indent}middleware: middleware${middlewares.length}`
      middlewares.push(`${input}/@middleware`)
    }

    const childrenDirs = fs
      .readdirSync(input)
      .filter(d => fs.statSync(path.join(input, d)).isDirectory() && !d.startsWith('@'))

    if (childrenDirs.length) {
      result += `,\n${indent}children: {\n`
      const names = childrenDirs.filter(d => !d.startsWith('_'))
      if (names.length) {
        result += `  ${indent}names: [\n`
        result += names
          .map(
            n =>
              `    ${indent}{\n      ${indent}name: '/${n}'${createText(
                path.posix.join(input, n),
                `      ${indent}`,
                params,
                userPath
              )}\n    ${indent}}`
          )
          .join(',\n')
        result += `\n  ${indent}]`
      }

      const value = childrenDirs.find(d => d.startsWith('_'))

      if (value) {
        result += `${
          names.length ? ',\n' : ''
        }  ${indent}value: {\n    ${indent}name: '/${value}'${createText(
          path.posix.join(input, value),
          `    ${indent}`,
          [...params, [value.slice(1).split('@')[0], value.split('@')[1] ?? 'string']],
          userPath
        )}\n  ${indent}}`
      }
      result += `\n${indent}}`
    }

    return result
  }

  const text = createText(inputDir, '  ', [])
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
    .join('\n')}\n\nexport const controllers = {\n  name: '/'${text}\n}`
}

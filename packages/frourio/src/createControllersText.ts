import path from 'path'
import fs from 'fs'
import { parse } from 'aspida/dist/commands'
import createDefaultFiles from './createDefaultFilesIfNotExists'

export default (inputDir: string) => {
  const middlewares: string[] = []
  const controllers: [string, boolean][] = []

  const createText = (
    dirPath: string,
    middleware: string[],
    params: [string, string][],
    appPath = '$app',
    user = ''
  ) => {
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
    const results: string[] = []

    if (methods?.length) {
      if (fs.existsSync(path.join(input, '@middleware.ts'))) {
        middleware.push(`\n            ...middleware${middlewares.length},`)
        middlewares.push(`${input}/@middleware`)
      }

      const ctrlText = fs.readFileSync(path.join(input, '@controller.ts'), 'utf8')
      const hasMiddleware = /export (const|{)(.*[ ,])?middleware[, }=]/.test(ctrlText)

      results.push(
        `    {\n      path: '${`/${dirPath}`
          .replace(/\/_/g, '/:')
          .replace(/@.+?($|\/)/g, '')}',\n      methods: [\n${methods
          .map(m => {
            const validateInfo = [
              { name: 'query', val: m.props.query },
              { name: 'body', val: m.props.reqBody },
              { name: 'headers', val: m.props.reqHeaders }
            ].filter(
              (prop): prop is { name: string; val: { value: string; hasQuestion: boolean } } =>
                !!prop.val?.value.startsWith(validatorPrefix)
            )

            return `        {
          name: '${m.name}',
          handlers: [${
            m.props.reqFormat?.value === 'FormData'
              ? '\n            uploader,\n            formatMulterData,'
              : ''
          }${
              validateInfo.length
                ? `\n            createValidateHandler(req => [
${validateInfo
  .map(
    v =>
      `              ${
        v.val.hasQuestion ? `Object.keys(req.${v.name}).length ? ` : ''
      }validateOrReject(Object.assign(new Types.${v.val.value}(), req.${v.name}))${
        v.val.hasQuestion ? ' : null' : ''
      }`
  )
  .join(',\n')}
            ]),`
                : ''
            }${
              dirPath.includes('@number')
                ? `\n            createTypedParamsHandler(['${dirPath
                    .split('/')
                    .filter(p => p.includes('@number'))
                    .map(p => p.split('@')[0].slice(1))
                    .join("', '")}']),`
                : ''
            }${
              middleware.length || hasMiddleware
                ? `${middleware.join('')}${
                    hasMiddleware
                      ? `\n            ...ctrlMiddleware${controllers.filter(c => c[1]).length},`
                      : ''
                  }`
                : ''
            }\n            methodsToHandler(controller${controllers.length}.${m.name})\n          ]
        }`
          })
          .join(',\n')}\n      ]\n    }`
      )

      controllers.push([`${input}/@controller`, hasMiddleware])
    }

    const childrenDirs = fs
      .readdirSync(input, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('@'))

    if (childrenDirs.length) {
      results.push(
        ...childrenDirs
          .filter(d => !d.name.startsWith('_'))
          .flatMap(d =>
            createText(path.posix.join(dirPath, d.name), middleware, params, appText, userPath)
          )
      )

      const value = childrenDirs.find(d => d.name.startsWith('_'))

      if (value) {
        results.push(
          ...createText(
            path.posix.join(dirPath, value.name),
            middleware,
            [...params, [value.name.slice(1).split('@')[0], value.name.split('@')[1] ?? 'string']],
            appText,
            userPath
          )
        )
      }
    }

    return results
  }

  const text = createText('', [], []).join(',\n')
  const ctrlMiddleware = controllers.filter(c => c[1])

  return {
    imports: `${text.includes('validateOrReject') ? "import * as Types from './types'" : ''}${
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
      .join('\n')}`,
    controllers: text
  }
}

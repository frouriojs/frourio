import path from 'path'
import fs from 'fs'
import { parse } from 'aspida/dist/commands'
import createDefaultFiles from './createDefaultFilesIfNotExists'

export default (inputDir: string) => {
  const hooksList: string[] = []
  const controllers: [string, boolean][] = []

  const createText = (
    dirPath: string,
    hooks: string[],
    params: [string, string][],
    appPath = '$app',
    user = ''
  ) => {
    const input = path.posix.join(inputDir, dirPath)
    const appText = `../${appPath}`
    const userPath =
      fs.existsSync(path.join(input, 'hooks.ts')) &&
      parse(fs.readFileSync(path.join(input, 'hooks.ts'), 'utf8'), 'User')
        ? './hooks'
        : user
        ? `./.${user}`
        : ''

    const relayPath = path.join(input, '$relay.ts')
    const text = `/* eslint-disable */\nimport { Deps } from 'velona'\nimport { ServerMethods, createHooks } from '${appText}'\n${
      userPath ? `import { User } from '${userPath}'\n` : ''
    }import { Methods } from './'\n\ntype ControllerMethods = ServerMethods<Methods, {${
      userPath ? '\n  user: User\n' : ''
    }${!userPath && params.length ? '\n' : ''}${
      params.length
        ? `  params: {\n${params.map(v => `    ${v[0]}: ${v[1]}`).join('\n')}\n  }\n`
        : ''
    }}>

export { createHooks }

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
      if (fs.existsSync(path.join(input, 'hooks.ts'))) {
        hooks.push(`hooks${hooksList.length}`)
        hooksList.push(`${input}/hooks`)
      }

      const ctrlText = fs.readFileSync(path.join(input, 'controller.ts'), 'utf8')
      const hasHooks = /export (const|{)(.*[ ,])?hooks[, }=]/.test(ctrlText)
      const genHookText = (prop: string) =>
        hooks.length || hasHooks
          ? `...margeHook(${
              hooks.length ? `${hooks.join(`.${prop}, `)}.${prop}${hasHooks ? ', ' : ''}` : ''
            }${hasHooks ? `ctrlHooks${controllers.filter(c => c[1]).length}.${prop}` : ''})`
          : ''

      results.push(
        methods
          .map(m => {
            const validateInfo = [
              { name: 'query', val: m.props.query },
              { name: 'body', val: m.props.reqBody },
              { name: 'headers', val: m.props.reqHeaders }
            ].filter(
              (prop): prop is { name: string; val: { value: string; hasQuestion: boolean } } =>
                !!prop.val?.value.startsWith(validatorPrefix)
            )

            const handlers = [
              genHookText('onRequest'),
              m.props.reqFormat?.value === 'FormData' || (!m.props.reqFormat && m.props.reqBody)
                ? genHookText('preParsing')
                : '',
              ...(m.props.reqFormat?.value === 'FormData' ? ['uploader', 'formatMulterData'] : []),
              !m.props.reqFormat && m.props.reqBody ? 'parseJSONBoby' : '',
              validateInfo.length || dirPath.includes('@number')
                ? genHookText('preValidation')
                : '',
              validateInfo.length
                ? `createValidateHandler(req => [
${validateInfo
  .map(
    v =>
      `      ${
        v.val.hasQuestion ? `Object.keys(req.${v.name}).length ? ` : ''
      }validateOrReject(Object.assign(new Types.${v.val.value}(), req.${v.name}))${
        v.val.hasQuestion ? ' : null' : ''
      }`
  )
  .join(',\n')}\n    ])`
                : '',
              dirPath.includes('@number')
                ? `createTypedParamsHandler(['${dirPath
                    .split('/')
                    .filter(p => p.includes('@number'))
                    .map(p => p.split('@')[0].slice(1))
                    .join("', '")}'])`
                : '',
              genHookText('preHandler'),
              `methodsToHandler(controller${controllers.length}.${m.name})`,
              genHookText('onSend')
            ].filter(Boolean)

            return `  app.${m.name}(\`\${basePath}${`/${dirPath}`
              .replace(/\/_/g, '/:')
              .replace(/@.+?($|\/)/g, '')}\`, ${
              handlers.length === 1 ? handlers[0] : `[\n    ${handlers.join(',\n    ')}\n  ]`
            })\n`
          })
          .join('\n')
      )

      controllers.push([`${input}/controller`, hasHooks])
    }

    const childrenDirs = fs
      .readdirSync(input, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('@'))

    if (childrenDirs.length) {
      results.push(
        ...childrenDirs
          .filter(d => !d.name.startsWith('_'))
          .flatMap(d =>
            createText(path.posix.join(dirPath, d.name), hooks, params, appText, userPath)
          )
      )

      const value = childrenDirs.find(d => d.name.startsWith('_'))

      if (value) {
        results.push(
          ...createText(
            path.posix.join(dirPath, value.name),
            hooks,
            [...params, [value.name.slice(1).split('@')[0], value.name.split('@')[1] ?? 'string']],
            appText,
            userPath
          )
        )
      }
    }

    return results
  }

  const text = createText('', [], []).join('\n')
  const ctrlHooks = controllers.filter(c => c[1])

  return {
    imports: `\n${
      text.includes('validateOrReject') ? "import * as Types from './types'\n" : ''
    }${controllers
      .map(
        (ctrl, i) =>
          `import controller${i}${
            ctrl[1] ? `, { hooks as ctrlHooks${ctrlHooks.indexOf(ctrl)} }` : ''
          } from '${ctrl[0].replace(/^api/, './api').replace(inputDir, './api')}'`
      )
      .join('\n')}${hooksList.length ? '\n' : ''}${hooksList
      .map(
        (m, i) => `import hooks${i} from '${m.replace(/^api/, './api').replace(inputDir, './api')}'`
      )
      .join('\n')}`,
    controllers: text
  }
}

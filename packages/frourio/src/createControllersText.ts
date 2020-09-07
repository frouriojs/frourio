import path from 'path'
import fs from 'fs'
import ts from 'typescript'
import createDefaultFiles from './createDefaultFilesIfNotExists'

const hooksEvents = ['onRequest', 'preParsing', 'preValidation', 'preHandler', 'onSend'] as const
type HooksEvent = typeof hooksEvents[number]

export default (inputDir: string) => {
  const hooksList: string[] = []
  const controllers: [string, boolean][] = []

  const createText = (
    dirPath: string,
    hooks: { name: string; events: { type: HooksEvent; isArray: boolean }[] }[],
    params: [string, string][],
    appPath = '$app',
    user = ''
  ) => {
    const input = path.posix.join(inputDir, dirPath)
    const appText = `../${appPath}`
    const userPath =
      fs.existsSync(path.join(input, 'hooks.ts')) &&
      /(^|\n)export .+ User(,| )/.test(fs.readFileSync(path.join(input, 'hooks.ts'), 'utf8'))
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

    const indexFile = path.join(input, 'index.ts')
    const hooksFile = path.join(input, 'hooks.ts')
    const controllerFile = path.join(input, 'controller.ts')
    const program = ts.createProgram([indexFile, hooksFile, controllerFile], {})
    const source = program.getSourceFile(indexFile)
    const results: string[] = []

    if (source) {
      const checker = program.getTypeChecker()
      const methods = ts.forEachChild(source, node =>
        (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
        node.name.escapedText === 'Methods' &&
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
          ? checker.getTypeAtLocation(node).getProperties()
          : undefined
      )

      if (methods?.length) {
        const hooksSource = program.getSourceFile(hooksFile)

        if (hooksSource) {
          const events = ts.forEachChild(hooksSource, node => {
            if (ts.isExportAssignment(node)) {
              return checker
                .getTypeAtLocation(node.expression)
                .getProperties()
                .map(p => {
                  const typeNode = checker.typeToTypeNode(
                    checker.getTypeOfSymbolAtLocation(p, p.valueDeclaration),
                    undefined,
                    undefined
                  )

                  return {
                    type: p.name as HooksEvent,
                    isArray: typeNode
                      ? ts.isArrayTypeNode(typeNode) || ts.isTupleTypeNode(typeNode)
                      : false
                  }
                })
            }
          })

          if (events) {
            hooks.push({ name: `hooks${hooksList.length}`, events })
            hooksList.push(`${input}/hooks`)
          }
        }

        const controllerSource = program.getSourceFile(controllerFile)
        let ctrlHooksNode: ts.Node | undefined

        if (controllerSource) {
          ctrlHooksNode = ts.forEachChild(controllerSource, node => {
            if (
              ts.isVariableStatement(node) &&
              node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
            ) {
              return node.declarationList.declarations.find(d => d.name.getText() === 'hooks')
            } else if (ts.isExportDeclaration(node)) {
              const { exportClause } = node
              if (exportClause && ts.isNamedExports(exportClause)) {
                return exportClause.elements.find(el => el.name.text === 'hooks')
              }
            }
          })
        }

        const ctrlHooksEvents =
          ctrlHooksNode &&
          checker
            .getTypeAtLocation(ctrlHooksNode)
            .getProperties()
            .map(p => {
              const typeNode = checker.typeToTypeNode(
                checker.getTypeOfSymbolAtLocation(p, p.valueDeclaration),
                undefined,
                undefined
              )

              return {
                type: p.name as HooksEvent,
                isArray: typeNode
                  ? ts.isArrayTypeNode(typeNode) || ts.isTupleTypeNode(typeNode)
                  : false
              }
            })

        const genHookTexts = (event: HooksEvent) => [
          ...hooks.flatMap(h => {
            const ev = h.events.find(e => e.type === event)
            return ev ? [`${ev.isArray ? '...' : ''}${h.name}.${event}`] : []
          }),
          ...(ctrlHooksEvents?.map(e =>
            e.type === event
              ? `${e.isArray ? '...' : ''}ctrlHooks${controllers.filter(c => c[1]).length}.${event}`
              : ''
          ) ?? [])
        ]

        results.push(
          methods
            .map(m => {
              const props = checker.getTypeOfSymbolAtLocation(m, m.valueDeclaration).getProperties()
              const query = props.find(p => p.name === 'query')
              const numberTypeQueryParams =
                query &&
                checker
                  .getTypeOfSymbolAtLocation(query, query.valueDeclaration)
                  .getProperties()
                  .map(p => {
                    const typeString = checker.typeToString(
                      checker.getTypeOfSymbolAtLocation(p, p.valueDeclaration)
                    )
                    return typeString === 'number'
                      ? `['${p.name}', ${p.declarations.some(d =>
                          d.getChildren().some(c => c.kind === ts.SyntaxKind.QuestionToken)
                        )}, false]`
                      : typeString === 'number[]'
                      ? `['${p.name}', ${p.declarations.some(d =>
                          d.getChildren().some(c => c.kind === ts.SyntaxKind.QuestionToken)
                        )}, true]`
                      : null
                  })
                  .filter(Boolean)
              const validateInfo = [
                { name: 'query', val: query },
                { name: 'body', val: props.find(p => p.name === 'reqBody') },
                { name: 'headers', val: props.find(p => p.name === 'reqHeaders') }
              ]
                .filter((prop): prop is { name: string; val: ts.Symbol } => !!prop.val)
                .map(({ name, val }) => ({
                  name,
                  type: checker.getTypeOfSymbolAtLocation(val, val.valueDeclaration),
                  hasQuestion: val.declarations.some(
                    d => d.getChildAt(1).kind === ts.SyntaxKind.QuestionToken
                  )
                }))
                .filter(({ type }) => type.isClass())

              const reqFormat = props.find(p => p.name === 'reqFormat')
              const isFormData =
                (reqFormat &&
                  checker.typeToString(
                    checker.getTypeOfSymbolAtLocation(reqFormat, reqFormat.valueDeclaration)
                  )) === 'FormData'
              const reqBody = props.find(p => p.name === 'reqBody')

              const handlers = [
                ...genHookTexts('onRequest'),
                ...(isFormData || (!reqFormat && reqBody) ? genHookTexts('preParsing') : []),
                numberTypeQueryParams && numberTypeQueryParams.length
                  ? `parseNumberTypeQueryParams([${numberTypeQueryParams.join(', ')}])`
                  : '',
                ...(isFormData && reqBody
                  ? [
                      'uploader',
                      `formatMulterData([${checker
                        .getTypeOfSymbolAtLocation(reqBody, reqBody.valueDeclaration)
                        .getProperties()
                        .map(p => {
                          const node = checker.typeToTypeNode(
                            checker.getTypeOfSymbolAtLocation(p, p.valueDeclaration),
                            undefined,
                            undefined
                          )

                          return node && (ts.isArrayTypeNode(node) || ts.isTupleTypeNode(node))
                            ? `['${p.name}', ${p.declarations.some(d =>
                                d.getChildren().some(c => c.kind === ts.SyntaxKind.QuestionToken)
                              )}]`
                            : undefined
                        })
                        .filter(Boolean)
                        .join(', ')}])`
                    ]
                  : []),
                !reqFormat && reqBody ? 'parseJSONBoby' : '',
                ...(validateInfo.length || dirPath.includes('@number')
                  ? genHookTexts('preValidation')
                  : []),
                validateInfo.length
                  ? `createValidateHandler(req => [
${validateInfo
  .map(
    v =>
      `      ${
        v.hasQuestion ? `Object.keys(req.${v.name}).length ? ` : ''
      }validateOrReject(Object.assign(new Validators.${checker.typeToString(v.type)}(), req.${
        v.name
      }))${v.hasQuestion ? ' : null' : ''}`
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
                ...genHookTexts('preHandler'),
                `methodsToHandler(controller${controllers.length}.${m.name})`,
                ...genHookTexts('onSend')
              ].filter(Boolean)

              return `  app.${m.name}(\`\${basePath}${`/${dirPath}`
                .replace(/\/_/g, '/:')
                .replace(/@.+?($|\/)/g, '')}\`, ${
                handlers.length === 1 ? handlers[0] : `[\n    ${handlers.join(',\n    ')}\n  ]`
              })\n`
            })
            .join('\n')
        )

        controllers.push([`${input}/controller`, !!ctrlHooksEvents])
      }
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
    imports: `${controllers
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

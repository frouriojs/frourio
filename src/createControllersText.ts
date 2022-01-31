import path from 'path'
import fs from 'fs'
import ts from 'typescript'
import createDefaultFiles from './createDefaultFilesIfNotExists'
import { addPrettierIgnore } from './addPrettierIgnore'
import type { LowerHttpMethod } from 'aspida'

type HooksEvent = 'onRequest' | 'preParsing' | 'preValidation' | 'preHandler'
type Param = [string, string]

const findRootFiles = (dir: string): string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .reduce<string[]>(
      (prev, d) => [
        ...prev,
        ...(d.isDirectory()
          ? findRootFiles(`${dir}/${d.name}`)
          : d.name === 'hooks.ts' || d.name === 'controller.ts'
          ? [`${dir}/${d.name}`]
          : [])
      ],
      []
    )

const initTSC = (appDir: string, project: string) => {
  const configDir = path.resolve(project.replace(/\/[^/]+\.json$/, ''))
  const configFileName = ts.findConfigFile(
    configDir,
    ts.sys.fileExists,
    project.endsWith('.json') ? project.split('/').pop() : undefined
  )

  const compilerOptions = configFileName
    ? ts.parseJsonConfigFileContent(
        ts.readConfigFile(configFileName, ts.sys.readFile).config,
        ts.sys,
        configDir
      )
    : undefined

  const program = ts.createProgram(
    findRootFiles(appDir),
    compilerOptions?.options
      ? { baseUrl: compilerOptions?.options.baseUrl, paths: compilerOptions?.options.paths }
      : {}
  )

  return { program, checker: program.getTypeChecker() }
}

const createRelayFile = (
  input: string,
  appText: string,
  additionalReqs: string[],
  params: Param[]
) => {
  const hasAdditionals = !!additionalReqs.length
  const hasMultiAdditionals = additionalReqs.length > 1
  const text = `/* eslint-disable */
import { Injectable, depend } from 'velona'
import type { FastifyInstance, onRequestHookHandler, preParsingHookHandler, preValidationHookHandler, preHandlerHookHandler } from 'fastify'
import type { Schema } from 'fast-json-stringify'
import type { HttpStatusOk } from 'aspida'
import type { ServerMethods } from '${appText}'
${
  hasMultiAdditionals
    ? additionalReqs
        .map(
          (req, i) =>
            `import type { AdditionalRequest as AdditionalRequest${i} } from '${req.replace(
              /^\.\/\./,
              '.'
            )}'\n`
        )
        .join('')
    : hasAdditionals
    ? `import type { AdditionalRequest } from '${additionalReqs[0]}'\n`
    : ''
}import type { Methods } from './'

${
  hasMultiAdditionals
    ? `type AdditionalRequest = ${additionalReqs
        .map((_, i) => `AdditionalRequest${i}`)
        .join(' & ')}\n`
    : ''
}${
    hasAdditionals
      ? 'type AddedHandler<T> = T extends (req: infer U, ...args: infer V) => infer W ? (req: U & Partial<AdditionalRequest>, ...args: V) => W : never\n'
      : ''
  }type Hooks = {
${[
  ['onRequest', 'onRequestHookHandler'],
  ['preParsing', 'preParsingHookHandler'],
  ['preValidation', 'preValidationHookHandler'],
  ['preHandler', 'preHandlerHookHandler']
]
  .map(([key, val]) =>
    hasAdditionals
      ? `  ${key}?: AddedHandler<${val}> | AddedHandler<${val}>[]\n`
      : `  ${key}?: ${val} | ${val}[]\n`
  )
  .join('')}}
type ControllerMethods = ServerMethods<Methods, ${hasAdditionals ? 'AdditionalRequest & ' : ''}{${
    params.length
      ? `\n  params: {\n${params.map(v => `    ${v[0]}: ${v[1]}`).join('\n')}\n  }\n`
      : ''
  }}>

export function defineResponseSchema<T extends { [U in keyof ControllerMethods]?: { [V in HttpStatusOk]?: Schema }}>(methods: () => T) {
  return methods
}

export function defineHooks<T extends Hooks>(hooks: (fastify: FastifyInstance) => T): (fastify: FastifyInstance) => T
export function defineHooks<T extends Record<string, any>, U extends Hooks>(deps: T, cb: (d: T, fastify: FastifyInstance) => U): Injectable<T, [FastifyInstance], U>
export function defineHooks<T extends Record<string, any>>(hooks: (fastify: FastifyInstance) => Hooks | T, cb?: (deps: T, fastify: FastifyInstance) => Hooks) {
  return cb && typeof hooks !== 'function' ? depend(hooks, cb) : hooks
}

export function defineController(methods: (fastify: FastifyInstance) => ControllerMethods): (fastify: FastifyInstance) => ControllerMethods
export function defineController<T extends Record<string, any>>(deps: T, cb: (d: T, fastify: FastifyInstance) => ControllerMethods): Injectable<T, [FastifyInstance], ControllerMethods>
export function defineController<T extends Record<string, any>>(methods: (fastify: FastifyInstance) => ControllerMethods | T, cb?: (deps: T, fastify: FastifyInstance) => ControllerMethods) {
  return cb && typeof methods !== 'function' ? depend(methods, cb) : methods
}
`

  fs.writeFileSync(
    path.join(input, '$relay.ts'),
    addPrettierIgnore(text.replace(', {}', '').replace(' & {}', '')),
    'utf8'
  )
}

const getAdditionalResPath = (input: string, name: string) =>
  fs.existsSync(path.join(input, `${name}.ts`)) &&
  /(^|\n)export .+ AdditionalRequest(,| )/.test(
    fs.readFileSync(path.join(input, `${name}.ts`), 'utf8')
  )
    ? [`./${name}`]
    : []

const createFiles = (
  appDir: string,
  dirPath: string,
  params: Param[],
  appPath: string,
  additionalRequestPaths: string[]
) => {
  const input = path.posix.join(appDir, dirPath)
  const appText = `../${appPath}`
  const additionalReqs = [
    ...additionalRequestPaths.map(p => `./.${p}`),
    ...getAdditionalResPath(input, 'hooks')
  ]

  createDefaultFiles(input)
  createRelayFile(
    input,
    appText,
    [...additionalReqs, ...getAdditionalResPath(input, 'controller')],
    params
  )

  fs.readdirSync(input, { withFileTypes: true }).forEach(
    d =>
      d.isDirectory() &&
      createFiles(
        appDir,
        path.posix.join(dirPath, d.name),
        d.name.startsWith('_')
          ? [...params, [d.name.slice(1).split('@')[0], d.name.split('@')[1] ?? 'string']]
          : params,
        appText,
        additionalReqs
      )
  )
}

export default (appDir: string, project: string) => {
  createFiles(appDir, '', [], '$server', [])

  const { program, checker } = initTSC(appDir, project)
  const hooksPaths: string[] = []
  const controllers: [string, boolean, boolean][] = []
  const createText = (
    dirPath: string,
    cascadingHooks: { name: string; events: { type: HooksEvent; isArray: boolean }[] }[]
  ) => {
    const input = path.posix.join(appDir, dirPath)
    const source = program.getSourceFile(path.join(input, 'index.ts'))
    const results: string[] = []
    let hooks = cascadingHooks

    if (source) {
      const methods = ts.forEachChild(source, node =>
        (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
        node.name.escapedText === 'Methods' &&
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
          ? checker.getTypeAtLocation(node).getProperties()
          : undefined
      )

      const hooksSource = program.getSourceFile(path.join(input, 'hooks.ts'))

      if (hooksSource) {
        const events = ts.forEachChild(hooksSource, node => {
          if (ts.isExportAssignment(node)) {
            return node.forEachChild(
              node =>
                ts.isCallExpression(node) &&
                node.forEachChild(node => {
                  if (
                    ts.isMethodDeclaration(node) ||
                    ts.isArrowFunction(node) ||
                    ts.isFunctionDeclaration(node)
                  ) {
                    return (
                      node.body &&
                      checker
                        .getTypeAtLocation(node.body)
                        .getProperties()
                        .map(p => {
                          const typeNode =
                            p.valueDeclaration &&
                            checker.typeToTypeNode(
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
                    )
                  }
                })
            )
          }
        })

        if (events) {
          hooks = [...cascadingHooks, { name: `hooks${hooksPaths.length}`, events }]
          hooksPaths.push(`${input}/hooks`)
        }
      }

      if (methods?.length) {
        const controllerSource = program.getSourceFile(path.join(input, 'controller.ts'))
        let isPromiseMethods: string[] = []
        let ctrlHooksSignature: ts.Signature | undefined
        let resSchemaSignature: ts.Signature | undefined

        if (controllerSource) {
          isPromiseMethods =
            ts.forEachChild(
              controllerSource,
              node =>
                ts.isExportAssignment(node) &&
                node.forEachChild(
                  nod =>
                    ts.isCallExpression(nod) &&
                    checker
                      .getSignaturesOfType(
                        checker.getTypeAtLocation(nod.arguments[nod.arguments.length - 1]),
                        ts.SignatureKind.Call
                      )[0]
                      .getReturnType()
                      .getProperties()
                      .map(
                        t =>
                          t.valueDeclaration &&
                          checker
                            .getSignaturesOfType(
                              checker.getTypeOfSymbolAtLocation(t, t.valueDeclaration),
                              ts.SignatureKind.Call
                            )[0]
                            .getReturnType()
                            .getSymbol()
                            ?.getEscapedName() === 'Promise' &&
                          t.name
                      )
                      .filter((n): n is string => !!n)
                )
            ) || []

          let ctrlHooksNode: ts.VariableDeclaration | ts.ExportSpecifier | undefined
          let resSchemaNode: ts.VariableDeclaration | ts.ExportSpecifier | undefined

          ts.forEachChild(controllerSource, node => {
            if (
              ts.isVariableStatement(node) &&
              node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
            ) {
              ctrlHooksNode =
                node.declarationList.declarations.find(d => d.name.getText() === 'hooks') ??
                ctrlHooksNode
              resSchemaNode =
                node.declarationList.declarations.find(
                  d => d.name.getText() === 'responseSchema'
                ) ?? resSchemaNode
            } else if (ts.isExportDeclaration(node)) {
              const { exportClause } = node
              if (exportClause && ts.isNamedExports(exportClause)) {
                ctrlHooksNode =
                  exportClause.elements.find(el => el.name.text === 'hooks') ?? ctrlHooksNode
                resSchemaNode =
                  exportClause.elements.find(el => el.name.text === 'responseSchema') ??
                  resSchemaNode
              }
            }
          })

          if (ctrlHooksNode) {
            ctrlHooksSignature = checker.getSignaturesOfType(
              checker.getTypeAtLocation(ctrlHooksNode),
              ts.SignatureKind.Call
            )[0]
          }

          if (resSchemaNode) {
            resSchemaSignature = checker.getSignaturesOfType(
              checker.getTypeAtLocation(resSchemaNode),
              ts.SignatureKind.Call
            )[0]
          }
        }

        const ctrlHooksEvents = ctrlHooksSignature
          ?.getReturnType()
          .getProperties()
          .map(p => {
            const typeNode =
              p.valueDeclaration &&
              checker.typeToTypeNode(
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
          ...hooks.reduce<string[]>((prev, h) => {
            const ev = h.events.find(e => e.type === event)
            return ev ? [...prev, `${ev.isArray ? '...' : ''}${h.name}.${event}`] : prev
          }, []),
          ...(ctrlHooksEvents?.map(e =>
            e.type === event
              ? `${e.isArray ? '...' : ''}ctrlHooks${controllers.filter(c => c[1]).length}.${event}`
              : ''
          ) ?? [])
        ]

        const resSchemaMethods = resSchemaSignature
          ?.getReturnType()
          .getProperties()
          .map(p => p.name as LowerHttpMethod)

        const genResSchemaText = (method: LowerHttpMethod) =>
          `schema: { response: responseSchema${controllers.filter(c => c[2]).length}.${method} }`
        const getSomeTypeQueryParams = (typeName: string, query: ts.Symbol) =>
          query.valueDeclaration &&
          checker
            .getTypeOfSymbolAtLocation(query, query.valueDeclaration)
            .getProperties()
            .map(p => {
              const typeString =
                p.valueDeclaration &&
                checker.typeToString(checker.getTypeOfSymbolAtLocation(p, p.valueDeclaration))
              return typeString === typeName || typeString === `${typeName}[]`
                ? `['${p.name}', ${!!p.declarations?.some(d =>
                    d.getChildren().some(c => c.kind === ts.SyntaxKind.QuestionToken)
                  )}, ${typeString === `${typeName}[]`}]`
                : null
            })
            .filter(Boolean)

        results.push(
          methods
            .map(m => {
              const props = m.valueDeclaration
                ? checker.getTypeOfSymbolAtLocation(m, m.valueDeclaration).getProperties()
                : []
              const query = props.find(p => p.name === 'query')
              const numberTypeQueryParams = query && getSomeTypeQueryParams('number', query)
              const booleanTypeQueryParams = query && getSomeTypeQueryParams('boolean', query)
              const validateInfo = [
                { name: 'query', val: query },
                { name: 'body', val: props.find(p => p.name === 'reqBody') },
                { name: 'headers', val: props.find(p => p.name === 'reqHeaders') }
              ]
                .filter((prop): prop is { name: string; val: ts.Symbol } => !!prop.val)
                .map(({ name, val }) => ({
                  name,
                  type:
                    val.valueDeclaration &&
                    checker.getTypeOfSymbolAtLocation(val, val.valueDeclaration),
                  hasQuestion: !!val.declarations?.some(
                    d => d.getChildAt(1).kind === ts.SyntaxKind.QuestionToken
                  )
                }))
                .filter(({ type }) => type?.isClass())

              const reqFormat = props.find(p => p.name === 'reqFormat')
              const isFormData =
                (reqFormat?.valueDeclaration &&
                  checker.typeToString(
                    checker.getTypeOfSymbolAtLocation(reqFormat, reqFormat.valueDeclaration)
                  )) === 'FormData'
              const reqBody = props.find(p => p.name === 'reqBody')
              const hooksTexts = (
                ['onRequest', 'preParsing', 'preValidation', 'preHandler'] as const
              )
                .map(key => {
                  if (key === 'preValidation') {
                    const texts = [
                      numberTypeQueryParams?.length
                        ? query?.declarations?.some(
                            d => d.getChildAt(1).kind === ts.SyntaxKind.QuestionToken
                          )
                          ? `callParserIfExistsQuery(parseNumberTypeQueryParams([${numberTypeQueryParams.join(
                              ', '
                            )}]))`
                          : `parseNumberTypeQueryParams([${numberTypeQueryParams.join(', ')}])`
                        : '',
                      booleanTypeQueryParams?.length
                        ? query?.declarations?.some(
                            d => d.getChildAt(1).kind === ts.SyntaxKind.QuestionToken
                          )
                          ? `callParserIfExistsQuery(parseBooleanTypeQueryParams([${booleanTypeQueryParams.join(
                              ', '
                            )}]))`
                          : `parseBooleanTypeQueryParams([${booleanTypeQueryParams.join(', ')}])`
                        : '',
                      isFormData && reqBody?.valueDeclaration
                        ? `formatMultipartData([${checker
                            .getTypeOfSymbolAtLocation(reqBody, reqBody.valueDeclaration)
                            .getProperties()
                            .map(p => {
                              const node =
                                p.valueDeclaration &&
                                checker.typeToTypeNode(
                                  checker.getTypeOfSymbolAtLocation(p, p.valueDeclaration),
                                  undefined,
                                  undefined
                                )

                              return node && (ts.isArrayTypeNode(node) || ts.isTupleTypeNode(node))
                                ? `['${p.name}', ${!!p.declarations?.some(d =>
                                    d
                                      .getChildren()
                                      .some(c => c.kind === ts.SyntaxKind.QuestionToken)
                                  )}]`
                                : undefined
                            })
                            .filter(Boolean)
                            .join(', ')}])`
                        : '',
                      ...genHookTexts('preValidation'),
                      ...(query &&
                      [...(numberTypeQueryParams ?? []), ...(booleanTypeQueryParams ?? [])].some(
                        t => t?.endsWith('true]')
                      ) &&
                      validateInfo.length
                        ? ['normalizeQuery']
                        : []),
                      validateInfo.length
                        ? `createValidateHandler(req => [
${validateInfo
  .map(v =>
    v.type
      ? `          ${
          v.hasQuestion ? `Object.keys(req.${v.name} as any).length ? ` : ''
        }validateOrReject(plainToInstance(Validators.${checker.typeToString(v.type)}, req.${
          v.name
        } as any, transformerOptions), validatorOptions)${v.hasQuestion ? ' : null' : ''}`
      : ''
  )
  .join(',\n')}\n        ])`
                        : '',
                      dirPath.includes('@number')
                        ? `createTypedParamsHandler(['${dirPath
                            .split('/')
                            .filter(p => p.includes('@number'))
                            .map(p => p.split('@')[0].slice(1))
                            .join("', '")}'])`
                        : ''
                    ].filter(Boolean)

                    return texts.length
                      ? `${key}: ${
                          texts.length === 1
                            ? texts[0].replace(/^\.+/, '')
                            : `[\n        ${texts.join(',\n        ')}\n      ]`
                        }`
                      : ''
                  }

                  const texts = genHookTexts(key).filter(Boolean)
                  return texts.length
                    ? `${key}: ${
                        texts.length === 1 ? texts[0].replace('...', '') : `[${texts.join(', ')}]`
                      }`
                    : ''
                })
                .filter(Boolean)

              return `  fastify.${m.name}(${
                hooksTexts.length || resSchemaMethods?.includes(m.name as LowerHttpMethod)
                  ? '\n    '
                  : ''
              }${
                dirPath
                  ? `\`\${basePath}${`/${dirPath}`
                      .replace(/\/_/g, '/:')
                      .replace(/@.+?($|\/)/g, '$1')}\``
                  : "basePath || '/'"
              },${
                hooksTexts.length || resSchemaMethods?.includes(m.name as LowerHttpMethod)
                  ? `\n    {\n      ${
                      resSchemaMethods?.includes(m.name as LowerHttpMethod)
                        ? `${genResSchemaText(m.name as LowerHttpMethod)}${
                            hooksTexts.length ? ',\n      ' : ''
                          }`
                        : ''
                    }${hooksTexts.join(',\n      ')}\n    }${
                      fs.readFileSync(`${input}/$relay.ts`, 'utf8').includes('AdditionalRequest')
                        ? ' as RouteShorthandOptions'
                        : ''
                    },\n    `
                  : ' '
              }${
                isPromiseMethods.includes(m.name) ? 'asyncMethodToHandler' : 'methodToHandler'
              }(controller${controllers.length}.${m.name})${
                hooksTexts.length || resSchemaMethods?.includes(m.name as LowerHttpMethod)
                  ? '\n  '
                  : ''
              })\n`
            })
            .join('\n')
        )

        controllers.push([`${input}/controller`, !!ctrlHooksEvents, !!resSchemaMethods])
      }
    }

    const childrenDirs = fs.readdirSync(input, { withFileTypes: true }).filter(d => d.isDirectory())

    if (childrenDirs.length) {
      results.push(
        ...childrenDirs
          .filter(d => !d.name.startsWith('_'))
          .reduce<string[]>(
            (prev, d) => [...prev, ...createText(path.posix.join(dirPath, d.name), hooks)],
            []
          )
      )

      const value = childrenDirs.find(d => d.name.startsWith('_'))

      if (value) {
        results.push(...createText(path.posix.join(dirPath, value.name), hooks))
      }
    }

    return results
  }

  const text = createText('', []).join('\n')
  const ctrlHooks = controllers.filter(c => c[1])
  const resSchemas = controllers.filter(c => c[2])

  return {
    imports: `${hooksPaths
      .map(
        (m, i) =>
          `import hooksFn${i} from '${m.replace(/^api/, './api').replace(appDir, './api')}'\n`
      )
      .join('')}${controllers
      .map(
        (ctrl, i) =>
          `import controllerFn${i}${
            ctrl[1] || ctrl[2]
              ? `, { ${ctrl[1] ? `hooks as ctrlHooksFn${ctrlHooks.indexOf(ctrl)}` : ''}${
                  ctrl[1] && ctrl[2] ? ', ' : ''
                }${
                  ctrl[2] ? `responseSchema as responseSchemaFn${resSchemas.indexOf(ctrl)}` : ''
                } }`
              : ''
          } from '${ctrl[0].replace(/^api/, './api').replace(appDir, './api')}'\n`
      )
      .join('')}`,
    consts: `${hooksPaths
      .map((_, i) => `  const hooks${i} = hooksFn${i}(fastify)\n`)
      .join('')}${ctrlHooks
      .map((_, i) => `  const ctrlHooks${i} = ctrlHooksFn${i}(fastify)\n`)
      .join('')}${resSchemas
      .map((_, i) => `  const responseSchema${i} = responseSchemaFn${i}()\n`)
      .join('')}${controllers
      .map((_, i) => `  const controller${i} = controllerFn${i}(fastify)\n`)
      .join('')}`,
    controllers: text
  }
}

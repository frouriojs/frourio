import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import type { Param } from './createDefaultFilesIfNotExists';
import { createDefaultFilesIfNotExists } from './createDefaultFilesIfNotExists';
import { createHash } from './createHash';
import { getArrayElementType } from './getArrayElementType';

type HooksEvent = 'onRequest' | 'preParsing' | 'preValidation' | 'preHandler';

const findRootFiles = (dir: string): string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .reduce<
      string[]
    >((prev, d) => [...prev, ...(d.isDirectory() ? findRootFiles(`${dir}/${d.name}`) : d.name === 'hooks.ts' || d.name === 'controller.ts' ? [`${dir}/${d.name}`] : [])], []);

const initTSC = (appDir: string, project: string) => {
  const configDir = path.resolve(project.replace(/\/[^/]+\.json$/, ''));
  const configFileName = ts.findConfigFile(
    configDir,
    ts.sys.fileExists,
    project.endsWith('.json') ? project.split('/').pop() : undefined,
  );

  const compilerOptions = configFileName
    ? ts.parseJsonConfigFileContent(
        ts.readConfigFile(configFileName, ts.sys.readFile).config,
        ts.sys,
        configDir,
      )
    : undefined;

  const program = ts.createProgram(findRootFiles(appDir), compilerOptions?.options ?? {});

  return { program, checker: program.getTypeChecker() };
};

const createRelayFile = (
  input: string,
  appText: string,
  additionalReqs: string[],
  params: Param[],
  currentParam: Param | null,
) => {
  const hasAdditionals = !!additionalReqs.length;
  const hasMultiAdditionals = additionalReqs.length > 1;
  const text = `import { Readable } from 'stream';
import { depend } from 'velona';
import { z } from 'zod';
import type { Injectable } from 'velona';
import type { MultipartFile } from '@fastify/multipart';
import type { FastifyInstance } from 'fastify';
import type { ServerHooks, ServerMethodHandler } from '${appText}';
${
  hasMultiAdditionals
    ? additionalReqs
        .map(
          (req, i) =>
            `import type { AdditionalRequest as AdditionalRequest${i} } from '${req.replace(
              /^\.\/\./,
              '.',
            )}';\n`,
        )
        .join('')
    : hasAdditionals
      ? `import type { AdditionalRequest } from '${additionalReqs[0]}';\n`
      : ''
}import type { Methods } from './';

${
  hasMultiAdditionals
    ? `type AdditionalRequest = ${additionalReqs
        .map((_, i) => `AdditionalRequest${i}`)
        .join(' & ')};\n\n`
    : ''
}${
    params.length
      ? `type Params = {\n${params.map(v => `  ${v[0]}: ${v[1]};`).join('\n')}\n};\n\n`
      : ''
  }${
    currentParam
      ? `export function defineValidators(validator: (fastify: FastifyInstance) => {
  params: z.ZodType<{ ${currentParam[0]}: ${currentParam[1]} }>,
}) {
  return validator;
}\n\n`
      : ''
  }export function defineHooks<T extends ServerHooks${
    hasAdditionals ? '<AdditionalRequest>' : ''
  }>(hooks: (fastify: FastifyInstance) => T): (fastify: FastifyInstance) => T
export function defineHooks<T extends Record<string, unknown>, U extends ServerHooks${
    hasAdditionals ? '<AdditionalRequest>' : ''
  }>(deps: T, cb: (d: T, fastify: FastifyInstance) => U): Injectable<T, [FastifyInstance], U>
export function defineHooks<T extends Record<string, unknown>>(hooks: (fastify: FastifyInstance) => ServerHooks${
    hasAdditionals ? '<AdditionalRequest>' : ''
  } | T, cb?: ((deps: T, fastify: FastifyInstance) => ServerHooks${
    hasAdditionals ? '<AdditionalRequest>' : ''
  })) {
  return cb && typeof hooks !== 'function' ? depend(hooks, cb) : hooks;
}

type ServerMethods = {
  [Key in keyof Methods]: ServerMethodHandler<Methods[Key]${
    hasAdditionals || params.length ? ', ' : ''
  }${hasAdditionals ? `AdditionalRequest${params.length ? ' & ' : ''}` : ''}${
    params.length ? '{ params: Params }' : ''
  }>;
};

export function defineController<M extends ServerMethods>(methods: (fastify: FastifyInstance) => M): (fastify: FastifyInstance) => M
export function defineController<M extends ServerMethods, T extends Record<string, unknown>>(deps: T, cb: (d: T, fastify: FastifyInstance) => M): Injectable<T, [FastifyInstance], M>
export function defineController<M extends ServerMethods, T extends Record<string, unknown>>(methods: ((fastify: FastifyInstance) => M) | T, cb?: ((deps: T, fastify: FastifyInstance) => M)) {
  return cb && typeof methods !== 'function' ? depend(methods, cb) : methods;
}

export const multipartFileValidator = (): z.ZodType<MultipartFile> =>
  z
    .object({
      type: z.literal('file'),
      toBuffer: z.function().returns(z.any()),
      file: z.instanceof(Readable).and(z.object({ truncated: z.boolean(), bytesRead: z.number() }).passthrough()),
      fieldname: z.string(),
      filename: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      fields: z.record(z.any()),
    })
    .passthrough();
`;

  fs.writeFileSync(
    path.join(input, '$relay.ts'),
    text.replace(', {}', '').replace(' & {}', ''),
    'utf8',
  );
};

const getAdditionalResPath = (input: string, name: string) =>
  fs.existsSync(path.join(input, `${name}.ts`)) &&
  /(^|\n)export .+ AdditionalRequest(,| )/.test(
    fs.readFileSync(path.join(input, `${name}.ts`), 'utf8'),
  )
    ? [`./${name}`]
    : [];

const createFiles = (
  appDir: string,
  dirPath: string,
  params: Param[],
  currentParam: Param | null,
  appPath: string,
  additionalRequestPaths: string[],
) => {
  const input = path.posix.join(appDir, dirPath);
  const appText = `../${appPath}`;
  const additionalReqs = [
    ...additionalRequestPaths.map(p => `./.${p}`),
    ...getAdditionalResPath(input, 'hooks'),
  ];

  createDefaultFilesIfNotExists(input, currentParam);
  createRelayFile(
    input,
    appText,
    [...additionalReqs, ...getAdditionalResPath(input, 'controller')],
    params,
    currentParam,
  );

  const dirs = fs.readdirSync(input, { withFileTypes: true }).filter(d => d.isDirectory());
  if (dirs.filter(d => d.name.startsWith('_')).length >= 2) {
    throw new Error('There are two ore more path param folders.');
  }

  dirs.forEach(d => {
    const currentParam = d.name.startsWith('_')
      ? ([d.name.slice(1).split('@')[0], d.name.split('@')[1] ?? 'string'] as [string, string])
      : null;
    return createFiles(
      appDir,
      path.posix.join(dirPath, d.name),
      currentParam ? [...params, currentParam] : params,
      currentParam,
      appText,
      additionalReqs,
    );
  });
};

type PathItem = { importName: string; name: string; path: string };

export default (appDir: string, project: string) => {
  createFiles(appDir, '', [], null, '$server', []);

  const { program, checker } = initTSC(appDir, project);
  const hooksPaths: PathItem[] = [];
  const validatorsPaths: PathItem[] = [];
  const controllerPaths: PathItem[] = [];
  const createText = (
    dirPath: string,
    cascadingHooks: { name: string; events: { type: HooksEvent; isArray: boolean }[] }[],
    cascadingValidators: { name: string; isNumber: boolean }[],
  ) => {
    const input = path.posix.join(appDir, dirPath);
    const source = program.getSourceFile(path.join(input, 'index.ts'));
    const results: string[] = [];
    let hooks = cascadingHooks;
    let paramsValidators = cascadingValidators;

    const nameToPath = (fileType: string): PathItem => {
      const val = `./${path.posix.join('api', dirPath, fileType)}`;
      const hash = createHash(val);

      return { importName: `${fileType}Fn_${hash}`, name: `${fileType}_${hash}`, path: val };
    };

    const validatorsFilePath = path.join(input, 'validators.ts');
    if (fs.existsSync(validatorsFilePath)) {
      const validatorPath = nameToPath('validators');

      paramsValidators = [
        ...cascadingValidators,
        { name: validatorPath.name, isNumber: dirPath.split('@')[1] === 'number' },
      ];

      validatorsPaths.push(validatorPath);
    }

    if (source) {
      const methods = ts.forEachChild(source, node =>
        (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
        node.name.escapedText === 'Methods' &&
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
          ? checker.getTypeAtLocation(node).getProperties()
          : undefined,
      );

      const hooksSource = program.getSourceFile(path.join(input, 'hooks.ts'));

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
                              undefined,
                            );

                          return {
                            type: p.name as HooksEvent,
                            isArray: typeNode
                              ? ts.isArrayTypeNode(typeNode) || ts.isTupleTypeNode(typeNode)
                              : false,
                          };
                        })
                    );
                  }
                }),
            );
          }
        });

        if (events) {
          const hooksPath = nameToPath('hooks');

          hooks = [...cascadingHooks, { name: hooksPath.name, events }];
          hooksPaths.push(hooksPath);
        }
      }

      if (methods?.length) {
        const controllerSource = program.getSourceFile(path.join(input, 'controller.ts'));
        const isPromiseMethods: string[] = [];
        const hasHandlerMethods: string[] = [];
        const hasValidatorsMethods: string[] = [];
        const hasSchemasMethods: string[] = [];
        const hasHooksMethods: {
          method: string;
          events: { type: HooksEvent; isArray: boolean }[];
        }[] = [];

        if (controllerSource) {
          const getMethodTypeNodes = <T>(
            cb: (symbol: ts.Symbol, typeNode: ts.TypeNode, type: ts.Type) => T | null,
          ): T[] =>
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
                        ts.SignatureKind.Call,
                      )[0]
                      .getReturnType()
                      .getProperties()
                      .map(t => {
                        const type =
                          t.valueDeclaration &&
                          checker.getTypeOfSymbolAtLocation(t, t.valueDeclaration);

                        if (!type) return null;

                        const typeNode =
                          t.valueDeclaration && checker.typeToTypeNode(type, undefined, undefined);

                        if (!typeNode) return null;

                        return cb(t, typeNode, type);
                      })
                      .filter(n => n !== null),
                ),
            ) || [];

          isPromiseMethods.push(
            ...getMethodTypeNodes((symbol, typeNode, type) => {
              const handler = ts.isFunctionTypeNode(typeNode)
                ? symbol
                : type.getProperties().find(p => p.name === 'handler');

              if (!handler) return null;

              return handler.valueDeclaration &&
                checker
                  .getSignaturesOfType(
                    checker.getTypeOfSymbolAtLocation(handler, handler.valueDeclaration),
                    ts.SignatureKind.Call,
                  )[0]
                  .getReturnType()
                  .getSymbol()
                  ?.getEscapedName() === 'Promise'
                ? symbol.name
                : null;
            }),
          );

          hasHandlerMethods.push(
            ...getMethodTypeNodes((symbol, typeNode) =>
              ts.isFunctionTypeNode(typeNode) ? null : symbol.name,
            ),
          );

          hasValidatorsMethods.push(
            ...getMethodTypeNodes((symbol, typeNode, type) =>
              !ts.isFunctionTypeNode(typeNode) &&
              type.getProperties().find(p => p.name === 'validators')
                ? symbol.name
                : null,
            ),
          );

          hasSchemasMethods.push(
            ...getMethodTypeNodes((symbol, typeNode, type) =>
              !ts.isFunctionTypeNode(typeNode) &&
              type.getProperties().find(p => p.name === 'schemas')
                ? symbol.name
                : null,
            ),
          );

          hasHooksMethods.push(
            ...getMethodTypeNodes((symbol, typeNode, type) => {
              if (ts.isFunctionTypeNode(typeNode)) return null;

              const hooksSymbol = type.getProperties().find(p => p.name === 'hooks');

              if (!hooksSymbol?.valueDeclaration) return null;

              return {
                method: symbol.name,
                events: checker
                  .getTypeOfSymbolAtLocation(hooksSymbol, hooksSymbol.valueDeclaration)
                  .getProperties()
                  .map(p => {
                    const typeNode =
                      p.valueDeclaration &&
                      checker.typeToTypeNode(
                        checker.getTypeOfSymbolAtLocation(p, p.valueDeclaration),
                        undefined,
                        undefined,
                      );

                    return {
                      type: p.name as HooksEvent,
                      isArray: typeNode
                        ? ts.isArrayTypeNode(typeNode) || ts.isTupleTypeNode(typeNode)
                        : false,
                    };
                  }),
              };
            }),
          );
        }

        const controllerPath = nameToPath('controller');

        const genHookTexts = (event: HooksEvent, methodName: string): string[] => [
          ...hooks.reduce<string[]>((prev, h) => {
            const ev = h.events.find(e => e.type === event);

            return ev ? [...prev, `${ev.isArray ? '...' : ''}${h.name}.${event}`] : prev;
          }, []),
          ...(hasHooksMethods.some(
            m => m.method === methodName && m.events.some(e => e.type === event),
          )
            ? [
                `${
                  hasHooksMethods
                    .find(m => m.method === methodName)
                    ?.events.find(e => e.type === event)?.isArray
                    ? '...'
                    : ''
                }${controllerPath.name}.${methodName}.hooks.${event}`,
              ]
            : []),
        ];

        const getSomeTypeParams = (typeName: string, dict: ts.Symbol): string[] | undefined => {
          const queryDeclaration = dict.valueDeclaration ?? dict.declarations?.[0];
          const type =
            queryDeclaration && checker.getTypeOfSymbolAtLocation(dict, queryDeclaration);

          if (!type) return;

          return checker
            .getNonNullableType(type)
            .getProperties()
            .map(p => {
              const declaration = p.valueDeclaration ?? p.declarations?.[0];
              const type = declaration && checker.getTypeOfSymbolAtLocation(p, declaration);

              if (!type) return null;

              const nonNullableType = checker.getNonNullableType(type);
              const arrayElementType = getArrayElementType(nonNullableType);
              const targetType = arrayElementType ?? nonNullableType;
              const returnResult = (type: ts.Type) =>
                (
                  type.isIntersection()
                    ? type.types.some(t => checker.typeToString(t) === typeName)
                    : checker.typeToString(type) === typeName
                )
                  ? `['${p.name}', ${(p.flags & ts.SymbolFlags.Optional) !== 0}, ${!!arrayElementType}]`
                  : null;

              return checker.typeToString(targetType) === typeName
                ? returnResult(targetType)
                : targetType.isUnion()
                  ? (targetType.types.map(returnResult).find(t => t !== null) ?? null)
                  : returnResult(targetType);
            })
            .filter(t => t !== null);
        };

        results.push(
          methods
            .map(m => {
              const props = m.valueDeclaration
                ? checker.getTypeOfSymbolAtLocation(m, m.valueDeclaration).getProperties()
                : [];
              const query = props.find(p => p.name === 'query');
              const stringArrayTypeQueryParams =
                query &&
                getSomeTypeParams('string', query)
                  ?.filter(params => params.endsWith(', true]'))
                  .map(params => params.replace(', true]', ']'));
              const numberTypeQueryParams = query && getSomeTypeParams('number', query);
              const booleanTypeQueryParams = query && getSomeTypeParams('boolean', query);
              const reqFormat = props.find(p => p.name === 'reqFormat');
              const reqFormatTypeString =
                reqFormat?.valueDeclaration &&
                checker.typeToString(
                  checker.getTypeOfSymbolAtLocation(reqFormat, reqFormat.valueDeclaration),
                );
              const isFormData = reqFormatTypeString === 'FormData';
              // Todo
              // const isURLSearchParams = reqFormatTypeString === 'URLSearchParams';
              const reqBody = props.find(p => p.name === 'reqBody');
              const hooksTexts: string[] = (
                ['onRequest', 'preParsing', 'preValidation', 'preHandler'] as const
              )
                .map(key => {
                  if (key === 'preValidation') {
                    const texts: string[] = [
                      stringArrayTypeQueryParams?.length
                        ? query?.declarations?.some(
                            d => d.getChildAt(1).kind === ts.SyntaxKind.QuestionToken,
                          )
                          ? `callParserIfExistsQuery(parseStringArrayTypeQueryParams([${stringArrayTypeQueryParams.join(
                              ', ',
                            )}]))`
                          : `parseStringArrayTypeQueryParams([${stringArrayTypeQueryParams.join(', ')}])`
                        : null,
                      numberTypeQueryParams?.length
                        ? query?.declarations?.some(
                            d => d.getChildAt(1).kind === ts.SyntaxKind.QuestionToken,
                          )
                          ? `callParserIfExistsQuery(parseNumberTypeQueryParams([${numberTypeQueryParams.join(
                              ', ',
                            )}]))`
                          : `parseNumberTypeQueryParams([${numberTypeQueryParams.join(', ')}])`
                        : null,
                      booleanTypeQueryParams?.length
                        ? query?.declarations?.some(
                            d => d.getChildAt(1).kind === ts.SyntaxKind.QuestionToken,
                          )
                          ? `callParserIfExistsQuery(parseBooleanTypeQueryParams([${booleanTypeQueryParams.join(
                              ', ',
                            )}]))`
                          : `parseBooleanTypeQueryParams([${booleanTypeQueryParams.join(', ')}])`
                        : null,
                      isFormData && reqBody?.valueDeclaration
                        ? `formatMultipartData([${checker
                            .getTypeOfSymbolAtLocation(reqBody, reqBody.valueDeclaration)
                            .getProperties()
                            .map(p => {
                              const declaration = p.valueDeclaration ?? p.declarations?.[0];
                              const type =
                                declaration && checker.getTypeOfSymbolAtLocation(p, declaration);
                              const typeString = type && checker.typeToString(type);

                              return typeString?.includes('[]')
                                ? `['${p.name}', ${(p.flags & ts.SymbolFlags.Optional) !== 0}]`
                                : undefined;
                            })
                            .filter(t => t !== undefined)
                            .join(', ')}], [${getSomeTypeParams('number', reqBody)?.join(
                            ', ',
                          )}], [${getSomeTypeParams('boolean', reqBody)?.join(', ')}])`
                        : null,
                      ...genHookTexts('preValidation', m.name),
                      dirPath.includes('@number')
                        ? `createTypedParamsHandler(['${dirPath
                            .split('/')
                            .filter(p => p.includes('@number'))
                            .map(p => p.split('@')[0].slice(1))
                            .join("', '")}'])`
                        : null,
                    ].filter(t => t !== null);

                    return texts.length
                      ? `${key}: ${
                          texts.length === 1
                            ? texts[0].replace(/^\.+/, '')
                            : `[\n        ${texts.join(',\n        ')},\n      ]`
                        }`
                      : null;
                  }

                  const texts = genHookTexts(key, m.name);

                  return texts.length
                    ? `${key}: ${
                        texts.length === 1 ? texts[0].replace('...', '') : `[${texts.join(', ')}]`
                      }`
                    : null;
                })
                .filter(t => t !== null);

              return `  fastify.${m.name}(${hooksTexts.length > 0 ? '\n    ' : ''}${
                dirPath
                  ? `\`\${basePath}${`/${dirPath}`
                      .replace(/\/_/g, '/:')
                      .replace(/@.+?($|\/)/g, '$1')}\``
                  : "basePath || '/'"
              },${(() => {
                const validatorsText = hasValidatorsMethods.includes(m.name)
                  ? `...validatorsToSchema(${controllerPath.name}.${m.name}.validators)`
                  : null;
                const schemasText = hasSchemasMethods.includes(m.name)
                  ? `...${controllerPath.name}.${m.name}.schemas`
                  : null;
                const paramsValidatorsText = paramsValidators.length
                  ? `params: ${paramsValidators
                      .map(
                        v => `${v.name}.params`,
                        // v.isNumber ? `z.preprocess(Number, ${v.name}.params)` : `${v.name}.params`
                      )
                      .join('.and(')}${paramsValidators.length > 1 ? ')' : ''}`
                  : null;
                const vals = [
                  ...(validatorsText && !schemasText && !paramsValidatorsText
                    ? [`schema: ${validatorsText.slice(3)}`]
                    : schemasText && !validatorsText && !paramsValidatorsText
                      ? [`schema: ${schemasText.slice(3)}`]
                      : validatorsText || schemasText || paramsValidatorsText
                        ? [
                            `schema: {\n        ${[
                              validatorsText,
                              schemasText,
                              paramsValidatorsText,
                            ]
                              .filter(t => t !== null)
                              .join(',\n        ')},\n      }`,
                          ]
                        : []),
                  ...(validatorsText || paramsValidatorsText ? ['validatorCompiler'] : []),
                  ...hooksTexts,
                ];

                return vals.length > 0
                  ? `\n    {\n      ${vals.join(',\n      ')},\n    }${
                      fs.readFileSync(`${input}/$relay.ts`, 'utf8').includes('AdditionalRequest')
                        ? ' as RouteShorthandOptions'
                        : ''
                    },`
                  : '';
              })()}${hooksTexts.length > 0 ? '\n    ' : ' '}${
                isPromiseMethods.includes(m.name) ? 'asyncMethodToHandler' : 'methodToHandler'
              }(${controllerPath.name}.${m.name}${
                hasHandlerMethods.includes(m.name) ? '.handler' : ''
              })${hooksTexts.length > 0 ? ',\n  ' : ''});\n`;
            })
            .join('\n'),
        );

        controllerPaths.push(controllerPath);
      }
    }

    const childrenDirs = fs
      .readdirSync(input, { withFileTypes: true })
      .filter(d => d.isDirectory());

    if (childrenDirs.length) {
      results.push(
        ...childrenDirs
          .filter(d => !d.name.startsWith('_'))
          .reduce<
            string[]
          >((prev, d) => [...prev, ...createText(path.posix.join(dirPath, d.name), hooks, paramsValidators)], []),
      );

      const value = childrenDirs.find(d => d.name.startsWith('_'));

      if (value) {
        results.push(...createText(path.posix.join(dirPath, value.name), hooks, paramsValidators));
      }
    }

    return results;
  };

  const text = createText('', [], []).join('\n');

  return {
    imports: `${hooksPaths
      .map(h => `import ${h.importName} from '${h.path}';\n`)
      .join('')}${validatorsPaths
      .map(v => `import ${v.importName} from '${v.path}';\n`)
      .join('')}${controllerPaths.map(c => `import ${c.importName} from '${c.path}';\n`).join('')}`,
    consts: `${hooksPaths
      .map(h => `  const ${h.name} = ${h.importName}(fastify);\n`)
      .join('')}${validatorsPaths
      .map(v => `  const ${v.name} = ${v.importName}(fastify);\n`)
      .join('')}${controllerPaths
      .map(c => `  const ${c.name} = ${c.importName}(fastify);\n`)
      .join('')}`,
    controllers: text,
  };
};

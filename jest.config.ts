import type { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest/utils'
import { compilerOptions } from './tsconfig.json'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: { Blob: {}, 'ts-jest': {} },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  coveragePathIgnorePatterns: ['\\$api.ts', 'dist']
}

export default config

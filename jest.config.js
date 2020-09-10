const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: { Blob: {} },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  coveragePathIgnorePatterns: ['\\$api.ts', 'dist']
}

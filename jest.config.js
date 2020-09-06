module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: { Blob: {} },
  coveragePathIgnorePatterns: ['\\$api.ts', 'dist']
}

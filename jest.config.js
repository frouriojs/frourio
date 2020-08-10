module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: { Blob: {} },
  testPathIgnorePatterns: ['apis'],
  coveragePathIgnorePatterns: ['apis', 'dist']
}

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['apis'],
  coveragePathIgnorePatterns: ['apis', 'dist']
}

import { run } from './$app'

run({
  port: 10000,
  basePath: '/api',
  staticDir: 'packages/frourio/public',
  cors: true
})

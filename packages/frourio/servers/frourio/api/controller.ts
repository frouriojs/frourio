import { createController } from './$relay'

export default createController(() => ({
  get: () => ({ status: 200, body: 'Hello world' })
}))

import { defineController } from './$relay'

export default defineController(() => ({
  get: () => Promise.resolve({ status: 200, body: 'sample' })
}))

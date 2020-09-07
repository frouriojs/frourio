import { defineController } from './$relay'

// @ts-expect-error
export default defineController(() => ({
  get: ({ query }) => ({ status: 200, body: query.val })
}))

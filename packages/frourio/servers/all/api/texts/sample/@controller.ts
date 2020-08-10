import { createController } from './$relay'

export default createController(() => ({
  // @ts-expect-error
  get: ({ query }) => ({ status: 200, body: query.val }),
  put: ({ body }) => ({ status: 200, body })
}))

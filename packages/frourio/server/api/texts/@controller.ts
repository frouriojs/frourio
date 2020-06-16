import { createController } from './$relay'

// @ts-expect-error
export default createController({
  get: ({ query }) => ({ status: 200, body: query.val })
})

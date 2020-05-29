import { createController } from 'frourio'
import { Methods } from './'

export default createController<Methods>({
  // @ts-expect-error
  get: ({ query }) => ({ status: 200, body: query.val }),
  put: ({ body }) => ({ status: 200, body })
})

import { createController } from 'frourio'
import { Methods } from './'

// @ts-expect-error
export default createController<Methods>({
  get: ({ query }) => ({ status: 200, body: query.val })
})

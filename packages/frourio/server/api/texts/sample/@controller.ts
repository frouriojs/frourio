import { createController } from 'frourio'
import { Values } from './$values'
import { Methods } from './'

export default createController<Methods, Values>({
  // @ts-expect-error
  get: ({ query }) => ({ status: 200, body: query.val }),
  put: ({ body }) => ({ status: 200, body })
})

import { createController } from 'frourio'
import { Values } from './$values'
import { Methods } from './'

// @ts-expect-error
export default createController<Methods, Values>({
  get: ({ query }) => ({ status: 200, body: query.val })
})

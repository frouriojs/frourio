import { createController } from 'frourio'
import { Values } from './$values'
import { Methods } from './'

export default createController<Methods, Values>({
  post: ({ body }) => ({
    status: 201,
    body: Object.entries(body).reduce(
      (p, [key, val]) => ({ ...p, [key]: Array.isArray(val) ? val.length : -1 }),
      {} as Methods['post']['resBody']
    )
  })
})

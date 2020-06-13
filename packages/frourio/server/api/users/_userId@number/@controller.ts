import { createController } from 'frourio'
import { Values } from './$values'
import { Methods } from './'

export default createController<Methods, Values>({
  get: ({ params }) => ({ status: 200, body: { id: params.userId, name: 'bbb' } })
})

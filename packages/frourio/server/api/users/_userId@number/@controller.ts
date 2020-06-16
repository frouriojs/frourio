import { createController } from './$relay'

export default createController({
  get: ({ params }) => ({ status: 200, body: { id: params.userId, name: 'bbb' } })
})

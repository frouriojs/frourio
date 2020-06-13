import { createController, createMiddleware } from 'frourio'
import { Values } from './$values'
import { Methods } from './'

const middleware = createMiddleware([
  (req, res, next) => {
    console.log('Controller level middleware:', req.path)
    next()
  }
])

export { middleware }

export default createController<Methods, Values>({
  get: async () => ({ status: 200, body: [{ id: 1, name: 'aa' }] }),
  post: () => ({ status: 204 })
})

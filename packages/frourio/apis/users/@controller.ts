import { createController, createMiddleware } from 'frourio'
import { Methods } from './'

const middleware = createMiddleware([
  (req, res, next) => {
    console.log('Controller level middleware:', req.path)
    next()
  }
])

export { middleware }

export default createController<Methods>({
  get: async () => ({ status: 200, body: [{ id: 1, name: 'aa' }] })
})

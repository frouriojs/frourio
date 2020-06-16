import { createController, createMiddleware } from './$relay'

const middleware = createMiddleware([
  (req, res, next) => {
    console.log('Controller level middleware:', req.path)
    next()
  }
])

export { middleware }

export default createController({
  get: async () => ({ status: 200, body: [{ id: 1, name: 'aa' }] }),
  post: () => ({ status: 204 })
})

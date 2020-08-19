import { createController, createHooks } from './$relay'

const hooks = createHooks(() => ({
  preHandler: [
    (req, res, next) => {
      console.log('Controller level preHandler hook:', req.path)
      next()
    }
  ]
}))

export { hooks }

export default createController(() => ({
  get: async () => ({ status: 200, body: [{ id: 1, name: 'aa' }] }),
  post: () => ({ status: 204 })
}))

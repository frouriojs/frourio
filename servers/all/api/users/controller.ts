import { defineController, defineHooks } from './$relay'

type AdditionalRequest = {
  tmp: string
}

const hooks = defineHooks(() => ({
  preHandler: [
    (req, _, done) => {
      console.log('Controller level preHandler hook:', req.url)
      done()
    }
  ]
}))

export { hooks, AdditionalRequest }

export default defineController(() => ({
  get: async () => ({ status: 200, body: [{ id: 1, name: 'aa' }] }),
  post: () => ({ status: 204 })
}))

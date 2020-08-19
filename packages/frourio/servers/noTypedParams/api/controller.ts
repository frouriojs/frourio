import { createController, createHooks } from './$relay'

export const hooks = createHooks(() => ({
  onRequest: (req, res, next) => {
    console.log('Controller level onRequest hook:', req.path)
    next()
  }
}))

export default createController(() => ({
  get: async v => {
    return await { status: 200, body: { id: +(v.query?.id || 0) } }
  },
  post: v => ({
    // @ts-expect-error
    status: 200,
    body: { id: +v.query.id, port: v.body.port, fileName: v.body.file.originalname }
  })
}))

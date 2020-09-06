import { createController, createHooks } from './$relay'
import { depend } from 'velona'

const hooks = createHooks({ print: (...args: string[]) => console.log(...args) }, ({ print }) => ({
  onRequest: depend({}, (deps, req, res, next) => {
    print('Controller level onRequest hook:', req.path)
    next()
  })
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

export { hooks }

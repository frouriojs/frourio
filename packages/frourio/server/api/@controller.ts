import { createController, createMiddleware } from 'frourio'
import { Values } from './$values'
import { Methods } from './'

export const middleware = createMiddleware((req, res, next) => {
  console.log('Controller level middleware:', req.path)
  next()
})

export default createController<Methods, Values>({
  get: async v => {
    return await { status: 200, body: { id: +(v.query?.id || 0) } }
  },
  post: v => ({
    // @ts-expect-error
    status: 200,
    // @ts-expect-error
    test: v.body.file,
    body: { id: +v.query.id, port: v.body.port, fileName: v.files[0].originalname }
  })
})

import { defineController, defineHooks } from '~/$relay'
import { depend } from 'velona'

const hooks = defineHooks({ print: (...args: string[]) => console.log(...args) }, ({ print }) => ({
  onRequest: depend({}, (_deps, req, _reply, done) => {
    print('Controller level onRequest hook:', req.url)
    done()
  })
}))

export default defineController(
  {
    log: (n: number) => {
      console.log(n)
      return Promise.resolve(n)
    }
  },
  ({ log }) => ({
    get: async v => {
      return { status: 200, body: { id: await log(+(v.query?.id || 0)) } }
    },
    post: v => ({
      // @ts-expect-error
      status: 200,
      body: { id: +v.query.id, port: v.body.port, fileName: v.body.file.filename }
    })
  })
)

export { hooks }

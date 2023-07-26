import { depend } from 'velona'
import { z } from 'zod'
import { defineController, defineHooks, defineResponseSchema } from '~/$relay'

const hooks = defineHooks({ print: (...args: string[]) => console.log(...args) }, ({ print }) => ({
  onRequest: depend({}, (_deps, req, _reply, done) => {
    print('Controller level onRequest hook:', req.url)
    done()
  })
}))

const responseSchema = defineResponseSchema(() => ({
  get: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        emptyNum: { type: 'number' },
        requiredNum: { type: 'number' },
        requiredNumArr: { type: 'array', items: { type: 'number' } },
        bool: { type: 'boolean' },
        optionalBool: { type: 'boolean' },
        boolArray: { type: 'array', items: { type: 'boolean' } },
        optionalBoolArray: { type: 'array', items: { type: 'boolean' } },
        disable: { type: 'string' }
      }
    }
  }
}))

export default defineController(
  {
    log: (n: string) => {
      console.log(n)
      return Promise.resolve(n)
    }
  },
  ({ log }) => ({
    get: async v => {
      return { status: 200, body: v.query && { ...v.query, id: await log(v.query.id) } }
    },
    post: v => ({
      status: 201,
      body: { id: +v.query.id, port: v.body.port, fileName: v.body.file.filename }
    }),
    put: {
      validators: {
        query: z.object({
          requiredNum: z.number(),
          optionalNum: z.number().optional(),
          optionalNumArr: z.array(z.number()).optional(),
          emptyNum: z.number().optional(),
          requiredNumArr: z.array(z.number()),
          id: z.string(),
          disable: z.string(),
          bool: z.boolean(),
          optionalBool: z.boolean().optional(),
          boolArray: z.array(z.boolean()),
          optionalBoolArray: z.array(z.boolean()).optional()
        }),
        body: z.object({ port: z.string() })
      },
      schemas: {
        response: {
          201: {
            type: 'object',
            properties: { id: { type: 'number' }, port: { type: 'string' } }
          }
        }
      },
      hooks: {
        preValidation: [],
        preHandler: (req, _, done) => {
          console.log(req.method)
          done()
        }
      },
      handler: v => ({
        status: 201,
        body: { id: +v.query.id, port: v.body.port }
      })
    }
  })
)

export { hooks, responseSchema }

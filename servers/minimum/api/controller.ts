import { defineController, defineResponseSchema } from './$relay'

export const responseSchema = defineResponseSchema(() => ({
  get: {
    200: {
      type: 'object',
      properties: {
        hello: {
          type: 'string'
        }
      }
    }
  }
}))

export default defineController(() => ({
  get: () => ({ status: 200, body: { hello: 'world' } })
}))

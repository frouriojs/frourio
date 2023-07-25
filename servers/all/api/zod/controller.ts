import { Methods } from '.'
import { defineController } from './$relay'
import { bodyValidator, queryValidator } from './validator'

export default defineController(() => ({
  get: {
    validators: { query: queryValidator },
    handler: ({ query }) => ({ status: 200, body: query })
  },
  post: {
    validators: { query: queryValidator },
    handler: ({ query }) => ({ status: 200, body: query })
  },
  put: {
    validators: { body: bodyValidator },
    handler: ({ body }) => ({
      status: 201,
      body: Object.entries(body).reduce(
        (p, [key, val]) => ({ ...p, [key]: Array.isArray(val) ? val.length : -1 }),
        {} as Methods['put']['resBody']
      )
    })
  }
}))

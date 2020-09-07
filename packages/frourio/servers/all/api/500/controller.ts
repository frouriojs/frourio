import { defineController } from './$relay'

export default defineController(() => ({
  get: () => {
    throw new Error('500 error test')
  }
}))

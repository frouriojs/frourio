import { createController } from './$relay'

export default createController(() => ({
  get: () => {
    throw new Error('500 error test')
  }
}))

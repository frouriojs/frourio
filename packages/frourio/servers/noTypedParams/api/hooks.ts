import { defineHooks } from './$relay'

export default defineHooks(() => ({
  onRequest: (req, res, next) => {
    console.log('Directory level middleware:', req.path)
    next()
  }
}))

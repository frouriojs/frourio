import { createHooks } from './$relay'

export default createHooks(() => ({
  onRequest: [
    (req, res, next) => {
      console.log('Directory level middleware:', req.path)
      next()
    }
  ],
  preParsing: (req, res, next) => {
    console.log('Directory level middleware:', req.path)
    next()
  }
}))

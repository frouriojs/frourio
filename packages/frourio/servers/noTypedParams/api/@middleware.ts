import { createMiddleware } from './$relay'

export default createMiddleware((req, res, next) => {
  console.log('Directory level middleware:', req.path)
  next()
})

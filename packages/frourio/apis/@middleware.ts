import { createMiddleware } from 'frourio'

export default createMiddleware((req, res, next) => {
  console.log('Directory level middleware:', req.path)
  next()
})

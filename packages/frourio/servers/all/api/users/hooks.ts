import { createHooks } from './$relay'

export type User = {
  id: number
  name: string
  role: 'admin' | 'user'
}

export default createHooks(() => ({
  onRequest: (req, res, next) => {
    console.log('Added user')
    ;(req as any).user = { id: 1, name: 'user name', role: 'admin' }
    next()
  }
}))

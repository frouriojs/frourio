import { defineHooks } from './$relay'

export type User = {
  id: number
  name: string
  role: 'admin' | 'user'
}

export default defineHooks(() => ({
  onRequest: (req, _, done) => {
    console.log('Added user')
    ;(req as any).user = { id: 1, name: 'user name', role: 'admin' }
    done()
  }
}))

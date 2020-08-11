import fastify from 'fastify'
import { run } from './frourio/$app'

const app = fastify()
const port = 3000
run(app, { port }).then(() => console.log(`Frourio is running on http://localhost:${port}`))

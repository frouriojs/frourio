import { Server } from 'http'
import fs from 'fs'
import FormData from 'form-data'
import axios from 'axios'
import aspida from '@aspida/axios'
import api from '../server/api/$api'
import { run } from '../server/$app'

const port = 11111
const baseURL = `http://localhost:${port}`
const client = api(aspida(undefined, { baseURL }))
let server: Server

beforeEach(async () => {
  server = (await run({ port, staticDir: 'packages/frourio/public' })).server
})

afterEach(fn => server.close(fn))

test('GET: 200', async () => {
  const res = await client.$get({ query: { id: '1', disable: 'false' } })
  expect(res?.id).toBe(1)
})

test('GET: string', async () => {
  const text = 'test'
  const res = await client.texts.$get({ query: { val: text } })
  expect(res).toBe(text)
})

test('GET: 400', async () => {
  await Promise.all([
    expect(client.get({ query: { id: '1', disable: 'no boolean' } })).rejects.toHaveProperty(
      'response.status',
      400
    ),
    expect(client.get({ query: { id: 'no number', disable: 'true' } })).rejects.toHaveProperty(
      'response.status',
      400
    )
  ])
})

test('POST: formdata', async () => {
  const port = '3000'
  const fileName = 'tsconfig.json'
  const form = new FormData()
  form.append('port', port)
  form.append('file', fs.createReadStream(fileName))
  const res = await axios.post(baseURL, form, {
    headers: form.getHeaders(),
    params: { id: 1, disable: true }
  })
  expect(res.data.port).toBe(port)
  expect(res.data.fileName).toBe(fileName)
})

test('GET: static', async () => {
  const res = await axios.get(`http://localhost:${port}/sample.json`)
  expect(res.data.sample).toBe(true)
})

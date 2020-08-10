import { Server } from 'http'
import fs from 'fs'
import FormData from 'form-data'
import axios from 'axios'
import { $arrayTypeKeysName } from 'aspida'
import aspida from '@aspida/axios'
import api from '../servers/all/api/$api'
import { run } from '../servers/all/$app'

const port = 11111
const baseURL = `http://localhost:${port}`
const client = api(aspida(undefined, { baseURL }))
let server: Server

beforeEach(async () => {
  server = (await run({ port })).app.server
})

afterEach(fn => {
  fs.rmdirSync('packages/frourio/servers/all/.upload', { recursive: true })
  server.close(fn)
})

test('GET: 200', async () => {
  const res = await client.$get({ query: { id: '1', disable: 'false' } })
  expect(res?.id).toBe(1)
})

test('GET: string', async () => {
  const text = 'test'
  const res = await client.texts.$get({ query: { val: text } })
  expect(res).toBe(text)
})

test('GET: params.userId', async () => {
  const userId = 1
  const res = await client.users._userId(userId).$get()
  expect(res.id).toBe(userId)
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

test('POST: multi file upload', async () => {
  const fileName = 'tsconfig.json'
  const form = new FormData()
  const fileST = fs.createReadStream(fileName)
  form.append('name', 'sample')
  form.append('vals', 'dammy')
  form.append('icon', fileST)
  form.append('files', fileST)
  form.append('files', fileST)
  form.append($arrayTypeKeysName, ['empty', 'vals', 'files'].join(','))
  const res = await axios.post(`${baseURL}/multiForm`, form, {
    headers: form.getHeaders()
  })
  expect(res.data).toEqual({
    [$arrayTypeKeysName]: undefined,
    empty: 0,
    name: -1,
    icon: -1,
    vals: 1,
    files: 2
  })
})

test('POST: 400', async () => {
  const fileName = 'tsconfig.json'
  const form = new FormData()
  const fileST = fs.createReadStream(fileName)
  form.append('name', 'sample')
  form.append('vals', 'dammy')
  form.append('icon', fileST)
  form.append($arrayTypeKeysName, ['empty', 'vals', 'files'].join(','))

  await expect(
    axios.post(`${baseURL}/multiForm`, form, {
      headers: form.getHeaders()
    })
  ).rejects.toHaveProperty('response.status', 400)
})

test('GET: static', async () => {
  const res = await axios.get(`http://localhost:${port}/sample.json`)
  expect(res.data.sample).toBe(true)
})

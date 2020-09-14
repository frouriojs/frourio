/* eslint-disable jest/no-done-callback */
import { Server } from 'http'
import fs from 'fs'
import express from 'express'
import FormData from 'form-data'
import axios from 'axios'
import aspida from '@aspida/axios'
import api from '../servers/all/api/$api'
import frourio from '../servers/all/$server'

const port = 11111
const baseURL = `http://localhost:${port}`
const client = api(aspida(undefined, { baseURL }))
let server: Server

beforeEach(cb => {
  server = frourio(express()).listen(port, cb)
})

afterEach(fn => {
  fs.rmdirSync('packages/frourio/servers/all/.upload', { recursive: true })
  server.close(fn)
})

test('GET: 200', async () => {
  const res = await client.$get({
    query: { requiredNum: 1, requiredNumArr: [1, 2], id: '1', disable: 'false' }
  })
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
    expect(
      client.get({ query: { requiredNum: 0, requiredNumArr: [], id: '1', disable: 'no boolean' } })
    ).rejects.toHaveProperty('response.status', 400),
    expect(
      client.get({
        query: { requiredNum: 1, requiredNumArr: [1, 2], id: 'no number', disable: 'true' }
      })
    ).rejects.toHaveProperty('response.status', 400)
  ])
})

test('GET: 500', async () => {
  await expect(client.$500.get()).rejects.toHaveProperty('response.status', 500)
})

test('PUT: JSON', async () => {
  const id = 'abcd'
  const res = await client.texts.sample.$put({ body: { id } })
  expect(res?.id).toBe(id)
})

test('POST: formdata', async () => {
  const port = '3000'
  const fileName = 'tsconfig.json'
  const form = new FormData()
  form.append('port', port)
  form.append('file', fs.createReadStream(fileName))
  const res = await axios.post(baseURL, form, {
    headers: form.getHeaders(),
    params: { requiredNum: 0, requiredNumArr: [], id: 1, disable: true }
  })
  expect(res.data.port).toBe(port)
  expect(res.data.fileName).toBe(fileName)
})

test('POST: multi file upload', async () => {
  const fileName = 'tsconfig.json'
  const form = new FormData()
  const fileST = fs.createReadStream(fileName)
  form.append('optionalArr', 'sample')
  form.append('name', 'sample')
  form.append('vals', 'dammy')
  form.append('icon', fileST)
  form.append('files', fileST)
  form.append('files', fileST)
  const res = await axios.post(`${baseURL}/multiForm`, form, {
    headers: form.getHeaders()
  })

  expect(res.data).toEqual({
    requiredArr: 0,
    optionalArr: 1,
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

  await expect(
    axios.post(`${baseURL}/multiForm`, form, {
      headers: form.getHeaders()
    })
  ).rejects.toHaveProperty('response.status', 400)
})

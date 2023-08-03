/* eslint-disable jest/no-done-callback */
import aspida from '@aspida/axios';
import aspidaFetch from '@aspida/node-fetch';
import axios from 'axios';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import fastify, { FastifyInstance } from 'fastify';
import FormData from 'form-data';
import fs from 'fs';
import frourio from '../servers/all/$server';
import api from '../servers/all/api/$api';
import controller from '../servers/all/api/controller';

const port = 11111;
const subPort = 22222;
const baseURL = `http://localhost:${port}`;
const subBasePath = '/api';
const subBaseURL = `http://localhost:${subPort}${subBasePath}`;
const client = api(aspida(undefined, { baseURL }));
const fetchClient = api(aspidaFetch(undefined, { baseURL: subBaseURL, throwHttpErrors: true }));
let server: FastifyInstance;
let subServer: FastifyInstance;
let subServerPlainToInstanceCallCount = 0;
let subServerValidateOrRejectCallCount = 0;

beforeEach(() => {
  server = fastify();
  subServer = fastify();
  subServerPlainToInstanceCallCount = 0;
  subServerValidateOrRejectCallCount = 0;
  return Promise.all([
    frourio(server).listen({ port }),
    frourio(subServer, {
      basePath: subBasePath,
      plainToInstance: (cls, object, options): object => {
        subServerPlainToInstanceCallCount++;
        return plainToInstance(cls, object, options);
      },
      validateOrReject: (instance, options): Promise<void> => {
        subServerValidateOrRejectCallCount++;
        return validateOrReject(instance, options);
      },
    }).listen({ port: subPort }),
  ]);
});

afterEach(() => Promise.all([server.close(), subServer.close()]));

test('GET: 200', () =>
  Promise.all(
    [
      {
        requiredNum: 1,
        requiredNumArr: [1, 2],
        id: '1',
        disable: 'false',
        bool: true,
        boolArray: [false, true],
      },
      {
        requiredNum: 2,
        emptyNum: 0,
        requiredNumArr: [],
        id: '1',
        disable: 'false',
        bool: false,
        optionalBool: true,
        boolArray: [],
        optionalBoolArray: [true, false, false],
      },
    ].map(query =>
      Promise.all([
        expect(client.$get({ query })).resolves.toEqual(query),
        expect(fetchClient.$get({ query })).resolves.toEqual(query),
      ])
    )
  ));

test('GET: string', async () => {
  const text = 'test';
  const res = await client.texts.get({ query: { val: text } });
  expect(res.body).toBe(text);
  expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
});

test('GET: params.userId and name', async () => {
  const userId = 1;
  const name = 'aaa';
  const res = await client.users._userId(userId).get();
  expect(res.body.id).toBe(userId);
  expect(res.headers['content-type']).toBe('application/json; charset=utf-8');

  const res2 = await client.users._userId(userId)._name(name).get();
  expect(res2.body).toBe(name);
  expect(res2.headers['content-type']).toBe('text/plain; charset=utf-8');
});

test('GET: 400 params.userId and name', async () => {
  await expect(
    client.users
      ._userId('aaa' as any)
      ._name(111)
      .get()
  ).rejects.toHaveProperty('response.status', 400);
});

test('GET: 400', () =>
  Promise.all(
    [
      {
        requiredNum: 0,
        requiredNumArr: [],
        id: '1',
        disable: 'no boolean',
        bool: false,
        boolArray: [],
      },
      {
        requiredNum: 0,
        requiredNumArr: [],
        id: '2',
        disable: 'true',
        bool: false,
        boolArray: ['no boolean'],
      },
      {
        requiredNum: 0,
        requiredNumArr: ['no number'],
        id: '3',
        disable: 'true',
        bool: false,
        boolArray: [],
      },
      {
        requiredNum: 1,
        requiredNumArr: [1, 2],
        id: 'no number',
        disable: 'true',
        bool: false,
        boolArray: [],
      },
    ].map(query =>
      Promise.all([
        // @ts-expect-error
        expect(client.get({ query })).rejects.toHaveProperty('response.status', 400),
        // @ts-expect-error
        expect(fetchClient.get({ query })).rejects.toHaveProperty('response.status', 400),
      ])
    )
  ));

test('GET: 500', async () => {
  await expect(client.$500.get()).rejects.toHaveProperty('response.status', 500);
});

test('PUT: JSON', async () => {
  const id = 'abcd';
  const res = await client.texts.sample.$put({ body: { id } });
  expect(res?.id).toBe(id);
});

test('POST: formdata', async () => {
  expect(subServerPlainToInstanceCallCount).toBe(0);
  expect(subServerValidateOrRejectCallCount).toBe(0);

  const port = '3000';
  const fileName = 'tsconfig.json';

  const form1 = new FormData();
  const fileST1 = fs.createReadStream(fileName);
  form1.append('port', port);
  form1.append('file', fileST1);
  const res1 = await axios.post(baseURL, form1, {
    params: { requiredNum: 0, id: '1', disable: 'true', bool: false },
    headers: form1.getHeaders(),
  });
  expect(res1.data.port).toBe(port);
  expect(res1.data.fileName).toBe(fileName);

  expect(subServerPlainToInstanceCallCount).toBe(0);
  expect(subServerValidateOrRejectCallCount).toBe(0);

  const form2 = new FormData();
  const fileST2 = fs.createReadStream(fileName);
  form2.append('port', port);
  form2.append('file', fileST2);
  const res2 = await axios.post(subBaseURL, form2, {
    params: { requiredNum: 0, id: '1', disable: 'true', bool: false },
    headers: form2.getHeaders(),
  });
  expect(res2.data.port).toBe(port);
  expect(res2.data.fileName).toBe(fileName);

  // 2 = query + body
  expect(subServerPlainToInstanceCallCount).toBe(2);
  expect(subServerValidateOrRejectCallCount).toBe(2);
});

test('PUT: zod validations', async () => {
  const port = '3000';

  await Promise.all([
    expect(
      fetchClient.put({
        query: {
          requiredNum: 0,
          requiredNumArr: [],
          id: '1',
          disable: 'true',
          bool: false,
          boolArray: [],
        },
        body: { port: 3000 as any },
      })
    ).rejects.toHaveProperty('response.status', 400),
    expect(
      fetchClient.put({
        query: {
          requiredNum: 0,
          requiredNumArr: [],
          id: '1',
          disable: 'true',
          bool: 1 as any,
          boolArray: [],
        },
        body: { port },
      })
    ).rejects.toHaveProperty('response.status', 400),
  ]);

  await expect(
    fetchClient.put({
      query: {
        requiredNum: 0,
        requiredNumArr: [],
        id: '1',
        disable: 'true',
        bool: false,
        boolArray: [],
      },
      body: { port },
    })
  ).resolves.toHaveProperty('status', 201);
});

test('POST: multi file upload', async () => {
  const fileName = 'tsconfig.json';
  const form = new FormData();
  const fileST = fs.createReadStream(fileName);
  form.append('optionalArr', 'sample');
  form.append('name', 'sample');
  form.append('vals', 'dammy');
  form.append('icon', fileST);
  form.append('files', fileST);
  form.append('files', fileST);
  const res = await axios.post(`${baseURL}/multiForm`, form, {
    headers: form.getHeaders(),
  });

  expect(res.data).toEqual({
    requiredArr: 0,
    optionalArr: 1,
    name: -1,
    icon: -1,
    vals: 1,
    files: 2,
  });
});

test('POST: 400', async () => {
  const fileName = 'tsconfig.json';
  const form = new FormData();
  const fileST = fs.createReadStream(fileName);
  form.append('name', 'sample');
  form.append('vals', 'dammy');
  form.append('icon', fileST);

  await expect(
    axios.post(`${baseURL}/multiForm`, form, {
      headers: form.getHeaders(),
    })
  ).rejects.toHaveProperty('response.status', 400);
});

test('POST: nested validation', async () => {
  const res1 = await client.users.post({
    body: {
      id: 123,
      name: 'foo',
      location: {
        country: 'JP',
        stateProvince: 'Tokyo',
      },
    },
  });
  expect(res1.status).toBe(204);

  // Note that extraneous properties are allowed by default
  const res2 = await client.users.post({
    body: {
      id: 123,
      name: 'foo',
      location: {
        country: 'JP',
        stateProvince: 'Tokyo',
        extra1: {
          extra1a: 'bar',
          extra1b: 'baz',
        },
      },
      extra2: 'qux',
    } as any,
  });
  expect(res2.status).toBe(204);
});

test('POST: 400 (nested validation)', async () => {
  // id is not a number
  await expect(
    client.users.post({
      body: {
        id: '123',
        name: 'foo',
        location: {
          country: 'JP',
          stateProvince: 'Tokyo',
        },
      } as any,
    })
  ).rejects.toHaveProperty('response.status', 400);

  // location is missing
  await expect(
    client.users.post({
      body: { id: 123, name: 'foo' } as any,
    })
  ).rejects.toHaveProperty('response.status', 400);

  // country is not a valid 2-letter country code
  await expect(
    client.users.post({
      body: {
        id: 123,
        name: 'foo',
        location: {
          country: 'XX',
          stateProvince: 'Tokyo',
        },
      } as any,
    })
  ).rejects.toHaveProperty('response.status', 400);

  // stateProvince is not a string
  await expect(
    client.users.post({
      body: {
        id: 123,
        name: 'foo',
        location: {
          country: 'JP',
          stateProvince: 1234,
        },
      } as any,
    })
  ).rejects.toHaveProperty('response.status', 400);
});

test('controller dependency injection', async () => {
  let val = 0;
  const id = '5';
  const injectedController = controller
    .inject({
      log: () => {
        throw new Error();
      },
    })
    .inject(() => ({
      log: n => {
        val = +n * 2;
        return Promise.resolve(`${val}`);
      },
    }))(server);

  await expect(
    injectedController.get({
      query: {
        id,
        requiredNum: 1,
        requiredNumArr: [0],
        disable: 'true',
        bool: false,
        boolArray: [],
      },
    })
  ).resolves.toHaveProperty('body.id', `${+id * 2}`);
  expect(val).toBe(+id * 2);
});

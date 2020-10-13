<br />
<div align="center">
  <img src="https://frouriojs.github.io/frourio/assets/images/ogp.png" width="1280" alt="frourio" />
</div>

<div align="center">
  <a href="https://www.npmjs.com/package/frourio">
    <img src="https://img.shields.io/npm/v/frourio" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/frourio">
    <img src="https://img.shields.io/npm/dm/frourio" alt="npm download" />
  </a>
  <a href="https://github.com/frouriojs/frourio/actions?query=workflow%3A%22Node.js+CI%22">
    <img src="https://github.com/frouriojs/frourio/workflows/Node.js%20CI/badge.svg?branch=master" alt="Node.js CI" />
  </a>
  <a href="https://codecov.io/gh/frouriojs/frourio">
    <img src="https://img.shields.io/codecov/c/github/frouriojs/frourio.svg" alt="Codecov" />
  </a>
  <a href="https://lgtm.com/projects/g/frouriojs/frourio/context:javascript">
    <img src="https://img.shields.io/lgtm/grade/javascript/g/frouriojs/frourio.svg" alt="Language grade: JavaScript" />
  </a>
</div>

<p align="center">Frourio is a perfectly type-checkable REST framework for TypeScript.</p>
<div align="center">
  <a href="https://github.com/frouriojs/frourio#readme">🇺🇸English</a> |
  <a href="https://github.com/frouriojs/frourio/tree/master/docs/ja#readme">🇯🇵日本語</a>
</div>
<br />
<br />
<br />

## Why frourio ?

フロントエンドとバックエンドの両方をTypeScriptで書いたとしても、APIの疎通を静的に型検査することは出来ない

常に "2つのTypeScript" を書かされている  
我々はブラウザとサーバーを動的にテストすることに多くの時間を浪費している

<div align="center">
   <img src="https://frouriojs.github.io/frourio/assets/images/problem.png" width="1200" alt="Why frourio ?" />
</div>
<br />
<br />

Frourio は "1つのTypeScript" で速く安全に開発するためのフレームワーク

<div align="center">
   <img src="https://frouriojs.github.io/frourio/assets/images/architecture.png" width="1200" alt="Architecture of create-frourio-app" />
</div>
<br />
<br />

## Benchmarks

__Machine:__ Linux fv-az18 5.4.0-1026-azure #26~18.04.1-Ubuntu SMP Thu Sep 10 16:19:25 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux | 2 vCPUs | 7GB.  
__Method:__ `autocannon -c 100 -d 40 -p 10 localhost:3000` (two rounds; one to warm-up, one to measure).

| Framework           | Version          | Requests/sec  | Latency   |
| :------------------ | :--------------- | ------------: | --------: |
| **frourio**         | **0.17.2**       | **58,654**    | **1.62**  |
| fastify             | 3.6.0	           | 57,867	       | 1.64      |
| nest-fastify        | 7.4.4            | 51,190        | 1.87      |
| frourio-express     | 0.17.1           | 11,466        | 8.60      |
| express             | 4.17.1	         | 10,899        | 9.04      |
| nest                | 7.4.4            | 9,587         | 10.31     |

出典: https://github.com/frouriojs/benchmarks

## Table of Contents

- [Install](#Install)
- [Express.js mode](#Expressjs)
- [Environment](#Environment)
- [Entrypoint](#Entrypoint)
- [Controller](#Controller)
  - [Case 1 - Define GET: /tasks?limit={number}](#Controller-case1)
  - [Case 2 - Define POST: /tasks](#Controller-case2)
  - [Case 3 - Define GET: /tasks/{taskId}](#Controller-case3)
- [HTTP client](#HttpClient)
- [Hooks](#Hooks)
  - [Lifecycle](#Lifecycle)
  - [Directory level hooks](#Hooks-dir)
  - [Controller level hooks](#Hooks-ctrl)
  - [Login with fastify-auth](#Hooks-login)
- [Validation](#Validation)
  - [Path parameter](#Validation-path)
  - [URL query](#Validation-query)
  - [JSON body](#Validation-json)
  - [Custom validation](#Validation-custom)
- [Error handling](#Error)
  - [Controller error handler](#Error-controller)
  - [The default error handler](#Error-default)
- [FormData](#FormData)
  - [Options](#FormData-options)
- [O/R mapping tool](#ORM)
  - [Prisma](#ORM-prisma)
  - [TypeORM](#ORM-typeorm)
- [CORS / Helmet](#CORS-Helmet)
- [Deployment](#Deployment)
  - [Frontend](#Deployment-frontend)
  - [Server](#Deployment-server)
- [Dependency Injection](#DI)

## Install

Make sure you have [npx](https://www.npmjs.com/package/npx) installed (`npx` is shipped by default since [npm](https://www.npmjs.com/get-npm) `5.2.0`)

```sh
$ npx create-frourio-app <my-project>
```

Or starting with npm v6.1 you can do:

```sh
$ npm init frourio-app <my-project>
```

Or with [yarn](https://yarnpkg.com/en/):

```sh
$ yarn create frourio-app <my-project>
```

<a id="Expressjs"></a>

## Express.js mode

frourio は HTTPサーバーに [Fastify](https://www.fastify.io/) を採用している  
もし create-frourio-app で [Express](https://expressjs.com/) を選んだ場合は以下リポジトリを参照  
[GitHub: frourio-express](https://github.com/frouriojs/frourio-express)

※ frourio は frourio-express よりも5倍以上速い

## Environment

frourio は TypeScript >= v3.9 と Node.js >= v12 の環境で動作する  
もし VSCode の TypeScript バージョンが低いと開発中にエラーが表示される

## Entrypoint

`server/index.ts`

```ts
import Fastify from 'fastify'
import server from './$server' // '$server.ts' は frourio が自動生成

const fastify = Fastify()

server(fastify, { basePath: '/api/v1' })
fastify.listen(3000)
```

## Controller

```sh
$ npm run dev
```

<a id="Controller-case1"></a>

### Case 1 - Define GET: /tasks?limit={number}

`server/types/index.ts`

```ts
export type Task = {
  id: number
  label: string
  done: boolean
}
```

`server/api/tasks/index.ts`

```ts
import { Task } from '$/types' // path alias $ -> server

export type Methods = {
  get: {
    query: {
      limit: number
    }

    resBody: Task[]
  }
}
```

`server/api/tasks/controller.ts`

```ts
import { defineController } from './$relay' // '$relay.ts' は frourio が自動生成
import { getTasks } from '$/service/tasks'

export default defineController(() => ({
  get: async ({ query }) => ({
    status: 200,
    body: (await getTasks()).slice(0, query.limit)
  })
}))
```

<a id="Controller-case2"></a>

### Case 2 - Define POST: /tasks

`server/api/tasks/index.ts`

```ts
import { Task } from '$/types' // path alias $ -> server

export type Methods = {
  post: {
    reqBody: Pick<Task, 'label'>
    status: 201
    resBody: Task
  }
}
```

`server/api/tasks/controller.ts`

```ts
import { defineController } from './$relay' // '$relay.ts' は frourio が自動生成
import { createTask } from '$/service/tasks'

export default defineController(() => ({
  post: async ({ body }) => {
    const task = await createTask(body.label)

    return { status: 201, body: task }
  }
}))
```

<a id="Controller-case3"></a>

### Case 3 - Define GET: /tasks/{taskId}

`server/api/tasks/_taskId@number/index.ts`

```ts
import { Task } from '$/types' // path alias $ -> server

export type Methods = {
  get: {
    resBody: Task
  }
}
```

`server/api/tasks/_taskId@number/controller.ts`

```ts
import { defineController } from './$relay' // '$relay.ts' is は frourio が自動生成
import { findTask } from '$/service/tasks'

export default defineController(() => ({
  get: async ({ params }) => {
    const task = await findTask(params.taskId)

    return task ? { status: 200, body: task } : { status: 404 }
  }
}))
```

<a id="HttpClient"></a>

## HTTP client

[aspida](https://github.com/aspida/aspida) を HTTP クライアントとして利用する  
(frourio と aspida は同じ開発者によってメンテナンスされている)

Next.js は [@aspida/swr](https://github.com/aspida/aspida/tree/master/packages/aspida-swr) も併用する

## Hooks

frourio は Fastify の hooks を扱える  
onRequest / preParsing / preValidation / preHandler の4種類のみ

### Lifecycle

```
Incoming Request
  │
  └─▶ Routing
        │
  404 ◀─┴─▶ onRequest Hook
              │
    4**/5** ◀─┴─▶ preParsing Hook
                    │
          4**/5** ◀─┴─▶ Parsing
                          │
                4**/5** ◀─┴─▶ preValidation Hook
                                │
                      4**/5** ◀─┴─▶ Validation
                                      │
                                400 ◀─┴─▶ preHandler Hook
                                            │
                                  4**/5** ◀─┴─▶ User Handler
                                                  │
                                        4**/5** ◀─┴─▶ Outgoing Response
```

<a id="Hooks-dir"></a>

### Directory level hooks

Directory level hooks は自身と配下のエンドポイントで呼ばれる

`server/api/tasks/hooks.ts`

```ts
import { defineHooks } from './$relay' // '$relay.ts' is automatically generated by frourio

export default defineHooks(() => ({
  onRequest: [
    (req, reply, done) => {
      console.log('Directory level onRequest first hook:', req.url)
      done()
    },
    (req, reply, done) => {
      console.log('Directory level onRequest second hook:', req.url)
      done()
    }
  ],
  preParsing: (req, reply, payload, done) => {
    console.log('Directory level preParsing single hook:', req.url)
    done()
  }
}))
```

<a id="Hooks-ctrl"></a>

### Controller level hooks

Controller level hooks は自身のエンドポイントのみで Directory level hooks のあとに呼ばれる

`server/api/tasks/controller.ts`

```ts
import { defineHooks, defineController } from './$relay' // '$relay.ts' is automatically generated by frourio
import { getTasks, createTask } from '$/service/tasks'

export const hooks = defineHooks(() => ({
  onRequest: (req, reply, done) => {
    console.log('Controller level onRequest single hook:', req.url)
    done()
  },
  preParsing: [
    (req, reply, payload, done) => {
      console.log('Controller level preParsing first hook:', req.url)
      done()
    },
    (req, reply, payload, done) => {
      console.log('Controller level preParsing second hook:', req.url)
      done()
    }
  ]
}))

export default defineController(() => ({
  get: async ({ query }) => ({
    status: 200,
    body: (await getTasks()).slice(0, query.limit)
  }),
  post: async ({ body }) => {
    const task = await createTask(body.label)

    return { status: 201, body: task }
  }
}))
```

<a id="Hooks-login"></a>

### Login with fastify-auth

```sh
$ cd server
$ npm install fastify-auth
```

```sh
$ cd server
$ yarn add fastify-auth
```

`server/index.ts`

```ts
import Fastify from 'fastify'
import fastifyAuth from 'fastify-auth'
import server from './$server' // '$server.ts' is automatically generated by frourio

const fastify = Fastify()

fastify.register(fastifyAuth).after(() => {
  server(fastify, { basePath: '/api/v1' })
})
fastify.listen(3000)
```

`server/api/user/hooks.ts`

```ts
import { defineHooks } from './$relay' // '$relay.ts' is automatically generated by frourio
import { getUserIdByToken } from '$/service/user'

// Export the User in hooks.ts to receive the user in controller.ts
export type User = {
  id: string
}

export default defineHooks((fastify) => ({
  preHandler: fastify.auth([
    (req, _, done) => {
      const user =
        typeof req.headers.token === 'string' &&
        getUserIdByToken(req.headers.token)

      if (user) {
        // eslint-disable-next-line
        // @ts-expect-error
        req.user = user
        done()
      } else {
        done(new Error('Unauthorized'))
      }
    }
  ])
}))
```

`server/api/user/controller.ts`

```ts
import { defineController } from './$relay'
import { getUserNameById } from '$/service/user'

export default defineController(() => ({
  get: async ({ user }) => ({ status: 200, body: await getUserNameById(user.id) })
}))
```

## Validation

<a id="Validation-path"></a>

### Path parameter

Path parameter can be specified as string or number type after `@`.  
(Default is `string | number`)

`server/api/tasks/_taskId@number/index.ts`

```ts
import { Task } from '$/types'

export type Methods = {
  get: {
    resBody: Task
  }
}
```

`server/api/tasks/_taskId@number/controller.ts`

```ts
import { defineController } from './$relay'
import { findTask } from '$/service/tasks'

export default defineController(() => ({
  get: async ({ params }) => {
    const task = await findTask(params.taskId)

    return task ? { status: 200, body: task } : { status: 404 }
  }
}))
```

```sh
$ curl http://localhost:8080/api/tasks
[{"id":0,"label":"sample task","done":false}]

$ curl http://localhost:8080/api/tasks/0
{"id":0,"label":"sample task","done":false}

$ curl http://localhost:8080/api/tasks/1 -i
HTTP/1.1 404 Not Found

$ curl http://localhost:8080/api/tasks/abc -i
HTTP/1.1 400 Bad Request
```

<a id="Validation-query"></a>

### URL query

number または number[] のプロパティは自動でバリデーションされる

`server/api/tasks/index.ts`

```ts
import { Task } from '$/types'

export type Methods = {
  get: {
    query?: {
      limit: number
    }
    resBody: Task[]
  }
}
```

`server/api/tasks/controller.ts`

```ts
import { defineController } from './$relay'
import { getTasks } from '$/service/tasks'

export default defineController(() => ({
  get: async ({ query }) => ({
    status: 200,
    body: (await getTasks()).slice(0, query?.limit)
  })
}))
```

```sh
$ curl http://localhost:8080/api/tasks
[{"id":0,"label":"sample task 0","done":false},{"id":1,"label":"sample task 1","done":false},{"id":1,"label":"sample task 2","done":false}]

$ curl http://localhost:8080/api/tasks?limit=1
[{"id":0,"label":"sample task 0","done":false}]

$ curl http://localhost:8080/api/tasks?limit=abc -i
HTTP/1.1 400 Bad Request
```

<a id="Validation-json"></a>

### JSON body

reqFormat の指定がない場合、 reqBody は `application/json` としてパースされる

`server/api/tasks/index.ts`

```ts
import { Task } from '$/types'

export type Methods = {
  post: {
    reqBody: Pick<Task, 'label'>
    resBody: Task
  }
}
```

`server/api/tasks/controller.ts`

```ts
import { defineController } from './$relay'
import { createTask } from '$/service/tasks'

export default defineController(() => ({
  post: async ({ body }) => {
    const task = await createTask(body.label)

    return { status: 201, body: task }
  }
}))
```

```sh
$ curl -X POST -H "Content-Type: application/json" -d '{"label":"sample task3"}' http://localhost:8080/api/tasks
{"id":3,"label":"sample task 3","done":false}

$ curl -X POST -H "Content-Type: application/json" -d '{Invalid JSON}' http://localhost:8080/api/tasks -i
HTTP/1.1 400 Bad Request
```

<a id="Validation-custom"></a>

### Custom validation

クラスで定義された query / reqHeaders / reqBody は [class-validator](https://github.com/typestack/class-validator) でバリデーションされる  
このクラスは `server/validators/index.ts` でエクスポートする必要がある

`server/validators/index.ts`

```ts
import { MinLength, IsString } from 'class-validator'

export class LoginBody {
  @MinLength(5)
  id: string

  @MinLength(8)
  pass: string
}

export class TokenHeader {
  @IsString()
  @MinLength(10)
  token: string
}
```

`server/api/token/index.ts`

```ts
import { LoginBody, TokenHeader } from '$/validators'

export type Methods = {
  post: {
    reqBody: LoginBody
    resBody: {
      token: string
    }
  }

  delete: {
    reqHeaders: TokenHeader
  }
}
```

```sh
$ curl -X POST -H "Content-Type: application/json" -d '{"id":"correctId","pass":"correctPass"}' http://localhost:8080/api/token
{"token":"XXXXXXXXXX"}

$ curl -X POST -H "Content-Type: application/json" -d '{"id":"abc","pass":"12345"}' http://localhost:8080/api/token -i
HTTP/1.1 400 Bad Request

$ curl -X POST -H "Content-Type: application/json" -d '{"id":"incorrectId","pass":"incorrectPass"}' http://localhost:8080/api/token -i
HTTP/1.1 401 Unauthorized
```

<a id="Error"></a>

## Error handling

<a id="Error-controller"></a>

### Controller error handler

`server/api/tasks/controller.ts`

```ts
import { defineController } from './$relay'
import { createTask } from '$/service/tasks'

export default defineController(() => ({
  post: async ({ body }) => {
    try {
      const task = await createTask(body.label)

      return { status: 201, body: task }
    } catch (e) {
      return { status: 500, body: 'Something broke!' }
    }
  }
}))
```

<a id="Error-default"></a>

### The default error handler

https://github.com/fastify/fastify/blob/master/docs/Hooks.md#onerror

`server/index.ts`

```ts
import Fastify from 'fastify'
import server from './$server'

const fastify = Fastify()

server(fastify, { basePath: '/api/v1' })

fastify.addHook('onError', (req, reply, err) => {
  console.error(err.stack)
})
fastify.listen(3000)
```

## FormData

FormData は [fastify-multipart](https://github.com/fastify/fastify-multipart) で自動パースされる

`server/api/user/index.ts`

```ts
export type Methods = {
  post: {
    reqFormat: FormData
    reqBody: { icon: Blob }
    status: 204
  }
}
```

Blob または Blob[] のプロパティは Multipart object に変換される

`server/api/user/controller.ts`

```ts
import { defineController } from './$relay'
import { changeIcon } from '$/service/user'

export default defineController(() => ({
  post: async ({ params, body }) => {
    // body.icon is multer object
    await changeIcon(params.userId, body.icon)

    return { status: 204 }
  }
}))
```

<a id="FormData-options"></a>

### Options

https://github.com/mscdex/busboy#busboy-methods

`server/index.ts`

```ts
import Fastify from 'fastify'
import server from './$server' // '$server.ts' is automatically generated by frourio

const fastify = Fastify()

server(fastify, { basePath: '/api/v1', multipart: { /* limit, ... */} })
fastify.listen(3000)
```

<a id="ORM"></a>

## O/R mapping tool

<a id="ORM-prisma"></a>

### Prisma

1. create-frourio-app でDBを選択
1. DB を起動
1. 開発コマンドを呼ぶ
    ```sh
    $ npm run dev
    ```
1. スキーマファイルを作成
    `server/prisma/schema.prisma`

    ```ts
    datasource db {
      provider = "mysql"
      url      = env("DATABASE_URL")
    }

    generator client {
      provider = "prisma-client-js"
    }

    model Task {
      id    Int     @id @default(autoincrement())
      label String
      done  Boolean @default(false)
    }
    ```
1. マイグレーションコマンドを呼ぶ
    ```sh
    $ npm run migrate
    ```
1. DB がマイグレーションされる

<a id="ORM-typeorm"></a>

### TypeORM

1. create-frourio-app でDBを選択
1. DB を起動
1. 開発コマンドを呼ぶ
    ```sh
    $ npm run dev
    ```
1. エンティティファイルを作成
    `server/entity/Task.ts`

    ```ts
    import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

    @Entity()
    export class Task {
      @PrimaryGeneratedColumn()
      id: number

      @Column({ length: 100 })
      label: string

      @Column({ default: false })
      done: boolean
    }
    ```
1. マイグレーションコマンドを呼ぶ
    ```sh
    $ npm run migration:generate
    ```
1. DB がマイグレーションされる

<a id="CORS-Helmet"></a>

## CORS / Helmet

```sh
$ cd server
$ npm install fastify-cors fastify-helmet
```

`server/index.ts`

```ts
import Fastify from 'fastify'
import helmet from 'helmet'
import cors from 'fastify-cors'
import server from './$server'

const fastify = Fastify()
fastify.register(helmet)
fastify.register(cors)

server(fastify, { basePath: '/api/v1' })
fastify.listen(3000)
```

## Deployment

frourio は一つのディレクトリで完結しているが、モノリシックではない  
フロントエンドとバックエンドは静的に型で繋がっているだけで個別のプロジェクトである  
なのでそれぞれ異なる環境にデプロイができる

<a id="Deployment-frontend"></a>

### Frontend

```sh
$ npm run build:front
$ npm run start:front
```

<a id="Deployment-server"></a>

### Server

```sh
$ npm run build:server
$ npm run start:server
```

or

```sh
$ cd server
$ npm run build
$ npm run start
```

<a id="DI"></a>

## Dependency Injection

Frourio use [frouriojs/velona](https://github.com/frouriojs/velona) for dependency injection.

`server/api/tasks/index.ts`

```ts
import { Task } from '$/types'

export type Methods = {
  get: {
    query?: {
      limit?: number
      message?: string
    }

    resBody: Task[]
  }
}
```

`server/service/tasks.ts`

```ts
import { PrismaClient } from '@prisma/client'
import { depend } from 'velona' // dependency of frourio
import { Task } from '$/types'

const prisma = new PrismaClient()

export const getTasks = depend(
  { prisma: prisma as { task: { findMany(): Promise<Task[]> } } }, // inject prisma
  async ({ prisma }, limit?: number) => // prisma is injected object
    (await prisma.task.findMany()).slice(0, limit)
)
```

`server/api/tasks/controller.ts`

```ts
import { defineController } from './$relay'
import { getTasks } from '$/service/tasks'

const print = (text: string) => console.log(text)

export default defineController(
  { getTasks, print }, // inject functions
  ({ getTasks, print }) => ({ // getTasks and print are injected function
    get: async ({ query }) => {
      if (query?.message) print(query.message)

      return { status: 200, body: await getTasks(query?.limit) }
    }
  })
)
```

`server/test/server.test.ts`

```ts
import controller from '$/api/tasks/controller'
import { getTasks } from '$/service/tasks'

test('dependency injection into controller', async () => {
  let printedMessage = ''

  const injectedController = controller.inject({
    getTasks: getTasks.inject({
      prisma: {
        task: {
          findMany: () =>
            Promise.resolve([
              { id: 0, label: 'task1', done: false },
              { id: 1, label: 'task2', done: false },
              { id: 2, label: 'task3', done: true },
              { id: 3, label: 'task4', done: true },
              { id: 4, label: 'task5', done: false }
            ])
        }
      }
    }),
    print: (text: string) => {
      printedMessage = text
    }
  })()

  const limit = 3
  const message = 'test message'
  const res = await injectedController.get({
    query: { limit, message }
  })

  expect(res.body).toHaveLength(limit)
  expect(printedMessage).toBe(message)
})
```

```sh
$ npm test

PASS server/test/server.test.ts
  ✓ dependency injection into controller (4 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.67 s, estimated 8 s
Ran all test suites.
```

## Support

<a href="https://twitter.com/m_mitsuhide">
  <img src="https://aspida.github.io/aspida/assets/images/twitter.svg" width="50" alt="Twitter" />
</a>

## License

Frourio is licensed under a [MIT License](https://github.com/frouriojs/frourio/blob/master/LICENSE).

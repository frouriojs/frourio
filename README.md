<br />
<img src="https://frouriojs.github.io/frourio/assets/images/ogp.png" width="1280" alt="frourio" />

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

<p align="center">Fast and type-safe full stack framework, for TypeScript</p>
<br />
<br />
<br />

## Why frourio ?

Even if you write both the frontend and backend in TypeScript, you can't statically type-check the API's sparsity.

We are always forced to write "Two TypeScript".  
We waste a lot of time on dynamic testing using the browser and server.

<div align="center">
   <img src="https://frourio.io/img/TwoTS.svg" width="1200" alt="Why frourio ?" />
</div>
<br />
<br />

Frourio is a framework for developing web apps quickly and safely in **"One TypeScript"**.

<div align="center">
   <img src="https://frourio.io/img/OneTS.svg" width="1200" alt="Architecture of create-frourio-app" />
</div>
<br />
<br />

## Documents

https://frourio.io/docs

## Table of Contents

- [Validation](#Validation)
- [Deployment](#Deployment)
  - [Client](#Deployment-client)
  - [Server](#Deployment-server)
- [License](#License)


## Validation

Query, reqHeaders and reqBody are validated by specifying Class with [class-validator](https://github.com/typestack/class-validator).  
The class needs to be exported from `server/validators/index.ts`.

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

## Deployment

Frourio is complete in one directory, but not monolithic.  
Client and server are just statically connected by a type and are separate projects.  
So they can be deployed in different environments.

<a id="Deployment-client"></a>

### Client

```sh
$ npm run build:client
$ npm run start:client
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

## License

Frourio is licensed under a [MIT License](https://github.com/frouriojs/frourio/blob/master/LICENSE).

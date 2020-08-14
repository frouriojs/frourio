# frourio

<a href="https://www.npmjs.com/package/frourio">
  <img src="https://img.shields.io/npm/v/frourio" alt="npm version" />
</a>
<a href="https://github.com/frouriojs/frourio/actions?query=workflow%3A%22Node.js+CI%22">
  <img src="https://github.com/frouriojs/frourio/workflows/Node.js%20CI/badge.svg?branch=master" alt="Node.js CI" />
</a>
<a href="https://codecov.io/gh/frouriojs/frourio">
  <img src="https://img.shields.io/codecov/c/github/frouriojs/frourio.svg" alt="Codecov" />
</a>
<a href="https://github.com/frouriojs/frourio/blob/master/packages/frourio/LICENSE">
  <img src="https://img.shields.io/npm/l/frourio" alt="License" />
</a>

> Perfectly type-checkable REST framework for TypeScript.


## Why frourio ?

Even if you write both the front and server in TypeScript, you can't statically type-check the API's sparsity.

We are always forced to write "Two TypeScript".  
We waste a lot of time on dynamic testing using the browser and Docker.

Frourio is a framework for developing web apps quickly and safely in "One TypeScript".

<div align="center">
   <img src="https://frouriojs.github.io/frourio/assets/images/problem.png" width="900" alt="Why frourio ?" />
</div>


## Architecture

In order to develop in "One TypeScript", `frourio` and `aspida` need to cooperate with each other.  
You can use `create-frourio-app` to make sure you don't fail in building your environment.

You can choose between Next.js or Nuxt.js for the front framework.  
Frourio is based on Express.js, so it's not difficult.

TypeORM setup is also completed automatically, so there is no failure in connecting to the DB.

Once the REST API endpoint interface is defined, the server controller implementation is examined by the type.  
The front is checked by the type to see if it is making an API request as defined in the interface.

[aspida: TypeScript friendly HTTP client wrapper for the browser and node.js.](https://github.com/aspidajs/aspida)

<div align="center">
   <img src="https://frouriojs.github.io/frourio/assets/images/architecture.png" width="900" alt="Architecture of create-frourio-app" />
</div>

## Usage

Make sure you have [npx](https://www.npmjs.com/package/npx) installed (`npx` is shipped by default since [npm](https://www.npmjs.com/get-npm) `5.2.0`)

```bash
npx create-frourio-app <my-project>
```

Or starting with npm v6.1 you can do:

```bash
npm init frourio-app <my-project>
```

Or with [yarn](https://yarnpkg.com/en/):

```bash
yarn create frourio-app <my-project>
```

## Environment

Frourio requires TypeScript 3.9 or higher.  
If the TypeScript version of VSCode is low, an error is displayed during development.

## Type definition of API endpoints

aspida: `/apis` --> frourio: `/server/api`

[See: Create an endpoint type definition file | aspida](https://github.com/aspidajs/aspida#create-an-endpoint-type-definition-file)

#### Warning !
examples.

> GET: /api/test

x- /server/api/test.ts  
o- /server/api/test/index.ts

> GET: /api/test/{testId}

x- /server/api/test/_testId.ts  
o- /server/api/test/_testId/index.ts

## Support

<a href="https://twitter.com/solufa2020">
  <img src="https://aspida.github.io/aspida/assets/images/twitter.svg" width="50" alt="Twitter" />
</a>

## License

frourio is licensed under a [MIT License](https://github.com/frouriojs/frourio/blob/master/packages/frourio/LICENSE).

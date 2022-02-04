{
  "name": "frourio",
  "version": "0.25.1",
  "description": "Fast and type-safe full stack framework, for TypeScript",
  "author": "Solufa <solufa2020@gmail.com>",
  "license": "MIT",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": "bin/index.js",
  "homepage": "https://frourio.io",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/frouriojs/frourio.git"
  },
  "bugs": {
    "url": "https://github.com/frouriojs/frourio/issues"
  },
  "files": [
    "dist"
  ],
  "keywords": [
    "typescript",
    "aspida",
    "fastify"
  ],
  "scripts": {
    "dev": "npm run build && cd servers && aspida && node build.js",
    "build": "npm run rimraf -- dist && tsc -p tsconfig.build.json",
    "rimraf": "node -e \"require('fs').rmdirSync(process.argv[1], { recursive: true })\"",
    "release": "standard-version --skip.tag",
    "release:major": "npm run release -- --release-as major",
    "release:minor": "npm run release -- --release-as minor",
    "release:patch": "npm run release -- --release-as patch",
    "lint": "eslint --ext .js,.ts --ignore-path .gitignore . && prettier --check \"./**/*.ts\"",
    "lint:fix": "eslint --ext .js,.ts --ignore-path .gitignore . --fix && prettier --write \"./**/*.ts\"",
    "test": "jest",
    "typecheck": "tsc --noEmit"
  },
  "eslintConfig": {
    "env": {
      "es6": true,
      "node": true,
      "browser": true
    },
    "extends": [
      "standard",
      "plugin:@typescript-eslint/recommended",
      "plugin:jest/recommended",
      "prettier"
    ],
    "parserOptions": {
      "ecmaVersion": 2018,
      "sourceType": "module"
    },
    "root": true,
    "rules": {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/camelcase": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  "prettier": {
    "printWidth": 100,
    "semi": false,
    "arrowParens": "avoid",
    "singleQuote": true,
    "trailingComma": "none",
    "overrides": [
      {
        "files": [
          "*.md",
          "*.yml"
        ],
        "options": {
          "singleQuote": false
        }
      }
    ]
  },
  "dependencies": {
    "aspida": "^1.7.1",
    "velona": "^0.7.0"
  },
  "devDependencies": {
    "@aspida/axios": "^1.7.1",
    "@aspida/node-fetch": "^1.7.1",
    "@types/busboy": "^0.2.3",
    "@types/jest": "^26.0.23",
    "@types/node-fetch": "^2.5.10",
    "@types/rimraf": "^3.0.0",
    "@typescript-eslint/eslint-plugin": "^4.28.1",
    "@typescript-eslint/parser": "^4.28.1",
    "axios": "^0.21.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.13.1",
    "eslint": "^7.30.0",
    "eslint-config-prettier": "^8.3.0",
    "eslint-config-standard": "^16.0.3",
    "eslint-plugin-import": "^2.23.4",
    "eslint-plugin-jest": "^24.3.6",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-promise": "^5.1.0",
    "eslint-plugin-standard": "^5.0.0",
    "fastify": "^3.18.1",
    "fastify-multipart": "^4.0.7",
    "jest": "^27.0.6",
    "node-fetch": "^2.6.1",
    "prettier": "^2.3.2",
    "reflect-metadata": "^0.1.13",
    "rimraf": "^3.0.2",
    "standard-version": "^9.3.0",
    "ts-jest": "^27.0.3",
    "ts-node": "^10.0.0",
    "typescript": "^4.3.5"
  }
}

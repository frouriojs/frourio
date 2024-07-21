import fs from 'fs';
import rimraf from 'rimraf';
import { expect, test } from 'vitest';
import { createDefaultFilesIfNotExists } from '../src/createDefaultFilesIfNotExists';

test('createDefaultFilesIfNotExists', () => {
  const dir = 'tmp';

  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  createDefaultFilesIfNotExists(dir, null);

  expect(fs.readFileSync(`${dir}/index.ts`, 'utf8'))
    .toBe(`import type { DefineMethods } from 'aspida';

export type Methods = DefineMethods<{
  get: {
    resBody: string;
  };
}>;
`);

  expect(fs.readFileSync(`${dir}/controller.ts`, 'utf8'))
    .toBe(`import { defineController } from './$relay';

export default defineController(() => ({
  get: () => ({ status: 200, body: '' }),
}));
`);

  expect(fs.existsSync(`${dir}/hooks.ts`)).toBeFalsy();

  fs.writeFileSync(`${dir}/hooks.ts`, '', 'utf8');
  createDefaultFilesIfNotExists(dir, null);

  expect(fs.readFileSync(`${dir}/hooks.ts`, 'utf8')).toBe(
    `import { defineHooks } from './$relay';

export default defineHooks(() => ({
  onRequest: (req, reply, done) => {
    console.log('Directory level onRequest hook:', req.url);
    done();
  },
}));
`
  );
  rimraf.sync(dir);

  fs.mkdirSync(dir);
  fs.writeFileSync(`${dir}/$test.ts`, '// test file');
  createDefaultFilesIfNotExists(dir, null);
  expect(fs.readdirSync(dir)).toEqual(['$test.ts']);

  rimraf.sync(dir);
});

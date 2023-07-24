import fs from 'fs';
import path from 'path';

export type Param = [string, string];

export const createDefaultFilesIfNotExists = (dir: string, currentParam: Param | null) => {
  const isEmptyDir = fs.readdirSync(dir).length === 0;

  const indexFilePath = path.join(dir, 'index.ts');

  if (isEmptyDir && !fs.existsSync(indexFilePath)) {
    fs.writeFileSync(
      indexFilePath,
      `export type Methods = {
  get: {
    resBody: string;
  };
};
`,
      'utf8'
    );
  }

  const controllerFilePath = path.join(dir, 'controller.ts');

  if (isEmptyDir && !fs.existsSync(controllerFilePath)) {
    fs.writeFileSync(
      controllerFilePath,
      `import { defineController } from './$relay';

export default defineController(() => ({
  get: () => ({ status: 200, body: 'Hello' })
}));
`,
      'utf8'
    );
  }

  const hooksFilePath = path.join(dir, 'hooks.ts');

  if (fs.existsSync(hooksFilePath) && !fs.readFileSync(hooksFilePath, 'utf8')) {
    fs.writeFileSync(
      hooksFilePath,
      `import { defineHooks } from './$relay';

export default defineHooks(() => ({
  onRequest: (req, reply, done) => {
    console.log('Directory level onRequest hook:', req.url);
    done();
  }
}));
`,
      'utf8'
    );
  }

  const validatorsFilePath = path.join(dir, 'validators.ts');

  if (currentParam && !fs.existsSync(validatorsFilePath)) {
    fs.writeFileSync(
      validatorsFilePath,
      `import { z } from 'zod';
import { defineValidators } from './$relay';

export default defineValidators(() => ({
  params: z.object({ ${currentParam[0]}: z.${currentParam[1]}() })
}));
`,
      'utf8'
    );
  }
};

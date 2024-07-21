import { z } from 'zod';
import type { Methods } from './';
import { defineController, multipartFileValidator } from './$relay';

export default defineController(() => ({
  post: {
    validators: {
      body: z.object({
        requiredArr: z.array(z.string()),
        optionalArr: z.array(z.string()).optional(),
        empty: z.array(z.number()).optional(),
        name: z.string(),
        icon: multipartFileValidator(),
        vals: z.array(z.string()),
        files: z.array(multipartFileValidator()),
      }),
    },
    handler: async ({ body }) => {
      const res = {
        status: 201 as const,
        body: Object.entries(body).reduce(
          (p, [key, val]) => ({ ...p, [key]: Array.isArray(val) ? val.length : -1 }),
          {} as Methods['post']['resBody'],
        ),
      };

      await body.icon.toBuffer(); // for validator test

      return res;
    },
  },
}));

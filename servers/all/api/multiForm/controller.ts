import { z } from 'zod';
import { Methods } from './';
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
    handler: ({ body }) => ({
      status: 201,
      body: Object.entries(body).reduce(
        (p, [key, val]) => ({ ...p, [key]: Array.isArray(val) ? val.length : -1 }),
        {} as Methods['post']['resBody']
      ),
    }),
  },
}));

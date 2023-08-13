import { z } from 'zod';
import { multipartValidator } from '~/zod/validator';
import { Methods } from './';
import { defineController } from './$relay';

export default defineController(() => ({
  post: {
    validators: {
      body: z.object({
        requiredArr: z.array(z.string()),
        optionalArr: z.array(z.string()).optional(),
        empty: z.array(z.number()).optional(),
        name: z.string(),
        icon: multipartValidator,
        vals: z.array(z.string()),
        files: z.array(multipartValidator),
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

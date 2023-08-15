import { z } from 'zod';
import { defineController } from './$relay';
import { userIdParser } from './validators';

export default defineController(() => ({
  get: {
    validators: { query: z.object({ id: userIdParser }) },
    handler: ({ params }) => ({ status: 200, body: params.label }),
  },
}));

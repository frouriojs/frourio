import { z } from 'zod';
import { defineController } from './$relay';

export default defineController(() => ({
  get: {
    validators: { query: z.object({ id: z.string(), disable: z.string() }) },
    handler: async v => {
      return await { status: 200, body: { id: +(v.query?.id || 0) } };
    },
  },
  // @ts-expect-error
  post: v => ({
    status: 200,
    body: { id: +v.query.id, port: v.body.port, fileName: v.body.file.filename },
  }),
}));

import { defineController } from './$relay';

export default defineController(() => ({
  // @ts-expect-error
  get: ({ query }) => ({ status: 200, body: query.val }),
  put: ({ body }) => ({ status: 200, body }),
}));

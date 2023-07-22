import { defineController } from './$relay';

// @ts-expect-error
export default defineController(() => ({
  get: ({ query }) => (query?.val ? { status: 200, body: query.val } : { status: 403 })
}));

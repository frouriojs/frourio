import { defineController } from './$relay';

export default defineController(() => ({
  get: async () => ({ status: 200, body: [{ id: 1, name: 'aa' }] }),
  post: { handler: () => ({ status: 204 }) },
}));

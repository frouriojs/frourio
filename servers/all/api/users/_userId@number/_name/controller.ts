import { defineController } from './$relay';

export default defineController(() => ({
  get: ({ params }) => ({ status: 200, body: params.name }),
}));

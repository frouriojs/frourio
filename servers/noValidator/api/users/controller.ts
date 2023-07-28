import { defineController, defineHooks } from './$relay';

const hooks = defineHooks(() => ({
  preHandler: [
    (req, _, done) => {
      console.log('Controller level preHandler hook:', req.url);
      done();
    }
  ]
}));

export { hooks };

export default defineController(() => ({
  get: async () => ({ status: 200, body: [{ id: 1, name: 'aa' }] }),
  post: { handler: () => ({ status: 204 }) }
}));

import { defineController, defineHooks } from './$relay';

export const hooks = defineHooks(() => ({
  onRequest: (req, _, done) => {
    console.log('Controller level onRequest hook:', req.url);
    done();
  }
}));

export default defineController(() => ({
  get: async v => {
    return await { status: 200, body: { id: +(v.query?.id || 0) } };
  },
  // @ts-expect-error
  post: v => ({
    status: 200,
    body: { id: +v.query.id, port: v.body.port }
  })
}));

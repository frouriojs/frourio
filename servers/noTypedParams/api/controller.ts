import { defineController } from './$relay';

export default defineController(() => ({
  get: async v => {
    return await { status: 200, body: { id: +(v.query?.id || 0) } };
  },
  // @ts-expect-error
  post: v => ({
    status: 200,
    body: { id: +v.query.id, port: v.body.port, fileName: v.body.file.filename },
  }),
}));

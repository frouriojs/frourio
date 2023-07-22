import { defineController } from './$relay';
import { Methods } from './';

export default defineController(() => ({
  post: ({ body }) => ({
    status: 201,
    body: Object.entries(body).reduce(
      (p, [key, val]) => ({ ...p, [key]: Array.isArray(val) ? val.length : -1 }),
      {} as Methods['post']['resBody']
    )
  })
}));

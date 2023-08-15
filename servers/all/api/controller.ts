import { queryValidator } from 'validators';
import { z } from 'zod';
import { defineController } from '~/$relay';

export default defineController(
  {
    log: (n: string) => {
      console.log(n);
      return Promise.resolve(n);
    },
  },
  ({ log }) => ({
    get: {
      validators: { query: queryValidator },
      handler: async v => {
        return { status: 200, body: v.query && { ...v.query, id: await log(v.query.id) } };
      },
    },
    post: v => ({
      status: 201,
      body: { id: +v.query.id, port: v.body.port, fileName: v.body.file.filename },
    }),
    put: {
      validators: {
        query: z.object({
          requiredNum: z.number(),
          optionalNum: z.number().optional(),
          optionalNumArr: z.array(z.number()).optional(),
          emptyNum: z.number().optional(),
          requiredNumArr: z.array(z.number()),
          id: z.string(),
          disable: z.string(),
          bool: z.boolean(),
          optionalBool: z.boolean().optional(),
          boolArray: z.array(z.boolean()),
          optionalBoolArray: z.array(z.boolean()).optional(),
        }),
        body: z.object({ port: z.string() }),
      },
      schemas: {
        response: {
          201: {
            type: 'object',
            properties: { id: { type: 'number' }, port: { type: 'string' } },
          },
        },
      },
      hooks: {
        preValidation: [],
        preHandler: (req, _, done) => {
          console.log(req.method);
          done();
        },
      },
      handler: v => ({
        status: 201,
        body: { id: +v.query.id, port: v.body.port },
      }),
    },
  })
);

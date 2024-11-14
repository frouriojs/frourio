import { defineController } from './$relay';

export type AdditionalRequest = {
  name: string;
};

export default defineController(() => ({
  get: {
    hooks: {
      preHandler: (req, _, done) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        !req.name && done();
      },
    },
    handler: ({ params }) => ({
      status: 200,
      body: {
        id: params.userId,
        name: 'bbb',
        location: {
          country: 'JP',
          stateProvince: 'Tokyo',
        },
      },
    }),
  },
}));

import { defineController } from './$relay';

type AdditionalRequest = {
  tmp: string;
};

export { AdditionalRequest };

export default defineController(() => ({
  get: async () => ({
    status: 200,
    body: [
      {
        id: 1,
        name: 'aa',
        location: {
          country: 'JP',
          stateProvince: 'Tokyo',
        },
      },
    ],
  }),
  post: () => ({ status: 204 }),
}));

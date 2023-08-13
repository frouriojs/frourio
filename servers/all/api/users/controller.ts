import { userInfoValidator } from 'validators';
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
  post: { validators: { body: userInfoValidator }, handler: () => ({ status: 204 }) },
}));

import { defineHooks } from './$relay';

export type AdditionalRequest = {
  cookie?: string;
};

export default defineHooks(() => ({
  onRequest: (_req, _, done) => {
    done();
  }
}));

import { defineHooks } from './$relay';

export default defineHooks(() => ({
  onRequest: [
    (req, _, done) => {
      console.log('Directory level middleware:', req.url);
      done();
    }
  ],
  preParsing: (req, _reply, _payload, done) => {
    console.log('Directory level middleware:', req.url);
    done();
  }
}));

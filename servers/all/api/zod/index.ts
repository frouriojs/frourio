import type { BodyValidator, QueryValidator } from './validator';

export type Methods = {
  get: {
    query: QueryValidator;
    resBody: QueryValidator;
  };
  post: {
    query?: QueryValidator;
    resBody: QueryValidator | undefined;
  };
  put: {
    reqFormat: FormData;
    reqBody: BodyValidator;
    resBody: {
      empty: number;
      name: number;
      icon: number;
      vals: number;
      files: number;
    };
  };
};

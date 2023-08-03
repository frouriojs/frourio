import { DefineMethods } from 'aspida';

export type Methods = DefineMethods<{
  get: {
    query?: {
      val: string;
      limit?: number;
    };
    resBody: string;
  };

  put: {};
}>;

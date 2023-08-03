import type { DefineMethods } from 'aspida';

export type Methods = DefineMethods<{
  put: {
    reqBody: {
      id: string;
    } | null;
    resBody: {
      id: string;
    } | null;
  };
}>;

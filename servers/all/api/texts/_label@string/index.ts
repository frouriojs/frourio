import type { DefineMethods } from 'aspida';
import type { UserId } from './validators';

export type Methods = DefineMethods<{
  get: {
    query: {
      id: UserId;
    };
    resBody: string;
  };
}>;

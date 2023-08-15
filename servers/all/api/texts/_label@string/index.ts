import type { DefineMethods } from 'aspida';
import { UserId } from './validators';

export type Methods = DefineMethods<{
  get: {
    query: {
      id: UserId;
    };
    resBody: string;
  };
}>;

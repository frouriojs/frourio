import type { DefineMethods } from 'aspida';
import type { Body, Query } from 'validators';

export type Methods = DefineMethods<{
  get: {
    query?: Query;
    status: 200;
    resBody?: Query | undefined;
  };

  post: {
    query: Query;
    reqFormat: FormData;
    reqBody: Body;
    status: 201;
    resBody: {
      id: number;
      port: string;
      fileName: string;
    };
  };
  put: {
    query: {
      requiredNum: number;
      optionalNum?: number | undefined;
      optionalNumArr?: Array<number> | undefined;
      emptyNum?: number | undefined;
      requiredNumArr: number[];
      id: string;
      disable: string;
      bool: boolean;
      optionalBool?: boolean | undefined;
      boolArray: boolean[];
      optionalBoolArray?: boolean[] | undefined;
    };
    reqBody: {
      port: string;
    };
    status: 201;
    resBody: {
      id: number;
      port: string;
    };
  };
}>;

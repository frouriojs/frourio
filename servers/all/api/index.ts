import { Query, Body } from 'validators';

export type Methods = {
  get: {
    query?: Query;
    status: 200;
    resBody?: Query;
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
      optionalNum?: number;
      optionalNumArr?: Array<number>;
      emptyNum?: number;
      requiredNumArr: number[];
      id: string;
      disable: string;
      bool: boolean;
      optionalBool?: boolean;
      boolArray: boolean[];
      optionalBoolArray?: boolean[];
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
};

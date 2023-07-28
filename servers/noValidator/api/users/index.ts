import { UserInfo } from '../../validators';

export type Methods = {
  get: {
    resBody: UserInfo[];
  };

  post: {
    reqBody: UserInfo;
  };
};

export type Query = {
  id: string;
  disable: string;
};

export type Body = {
  port: string;
  file: File;
};

export type UserInfo = {
  id: number;
  name: string;
};

export type MultiForm = {
  empty: number[];
  name: string;
  icon: Blob;
  vals: string[];
  files: Blob[];
};

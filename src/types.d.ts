/* eslint-disable @typescript-eslint/no-explicit-any */

export type Class<T = any> = {
  new(...args: any[]): T;
};

export interface T {
  new(args: any)
}

export type Func = (any?) => any;

export type Obj = {
  [id: string]: any;
};

import RestError from './errors/RestError';
import { Db, dbTypes } from './db';
import createQuery, { PLSql, createUnsecureQuery } from './createQuery';
import mapper from './mapper';
import dto from './_base/dto';
import type { Query as $Query } from './createQuery';

export * from './_base/str';

export type Query = $Query;

export interface BackendError extends RestError {}

type Credentials = {
  user: string,
  password: string,
  connectString: string,
}

export type DbInit = {
  credentials: Credentials,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onExec?: (db: Db<any>, outBinds: any) => unknown,
}

export default function <T = undefined>(userName: string) {
  return new Db<T>(userName);
}

export {
  Db,
  PLSql,
  dbTypes,
  mapper,
  createQuery,
  createUnsecureQuery,
  RestError,
  dto,
};

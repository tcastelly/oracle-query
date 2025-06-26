import { protectValue } from './_base/utils';
import RestError from './errors/RestError';
import { Db, dbTypes } from './db';
import DbError from './errors/DbError';
import type { Query as $Query } from './createQuery';
import createQuery, { createUnsecureQuery, PLSql } from './createQuery';
import type { Obj } from './types';

export * from './mapper';

export * from './_base/str';

export type Query<T = Obj> = $Query<T>;

export interface BackendError extends RestError {}

type Credentials = {
  user: string,
  password: string,
  connectString: string,
}

export type DbInit = {
  credentials: Credentials,

  onExec?: (db: Db<any>, outBinds: any) => unknown,
}

export default function <T = undefined>(userName: string) {
  return new Db<T>(userName);
}

export {
  Db,
  PLSql,
  dbTypes,
  createQuery,
  createUnsecureQuery,
  RestError,
  protectValue,
  DbError,
};

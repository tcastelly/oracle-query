import RestError from '@/errors/RestError';
import { Db, dbTypes } from './db';
import createQuery, { PLSql, createUnsecureQuery } from './createQuery';
import type { Query as $Query } from './createQuery';

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
  createQuery,
  createUnsecureQuery,
};

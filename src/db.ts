import { Readable } from 'stream';
import oracledb from 'oracledb';
import type { Lob, BindParameters } from 'oracledb';
import { kebabCaseToCamelcase } from '@/_base/str';
import type { DbInit } from './index';
import newClobs from './newClobs';
import DbError from './errors/DbError';
import map from './mapper';
import type { Obj } from './types';
import type { Query } from './createQuery';

const dbTypes = {
  BLOB: oracledb.BLOB,
  BUFFER: oracledb.BUFFER,
  CLOB: oracledb.CLOB,
  CURSOR: oracledb.CURSOR,
  DATE: oracledb.DATE,
  DEFAULT: oracledb.DEFAULT,
  NUMBER: oracledb.NUMBER,
  STRING: oracledb.STRING,
} as const;

type OutputType = {
  metaData: Array<{ name: string }>,
};

type OutputCursorType = {
  getRows: () => Promise<unknown[]>,
  close: () => void,
  toQueryStream: () => {
    on: (
      eventName: 'data' | 'error' | 'close' | 'end',
      cb: (args: unknown) => Promise<void> | void,
    ) => void,
  },
} & OutputType;

const mapColumn: (columns: Array<{ name: string }>) => Array<string> = (metaData) => metaData
  .map((column) => kebabCaseToCamelcase(column.name));

// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-use-before-define,@typescript-eslint/no-explicit-any
function defaultMap<T>(this: Db<T>, v: {[id: string]: unknown} | string, i: number): any {
  if (v && this._outputVarType === oracledb.CURSOR) {
    return map(v);
  }
  return v;
}

type OutputVarType = typeof oracledb.CURSOR
  | typeof oracledb.STRING
  | typeof oracledb.DATE
  | typeof oracledb.BLOB
  | typeof oracledb.CLOB
  | typeof oracledb.NUMBER;

class Db<T> {
  // list of map to apply
  _map = defaultMap;

  // try to log udpate queries
  _logQuery: null | boolean | (() => boolean) = null;

  _query: Query;

  _outputVarType: OutputVarType = oracledb.STRING;

  _outputVarName: 'res' | 'cursor' = 'res';

  static _pool: oracledb.Pool;

  // user logged to the application
  _userName: string;

  constructor(userName: string) {
    this._userName = userName;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
  static onExec(db: Db<any>, outBinds: OutputCursorType): any {
    return outBinds;
  }

  log(logQuery: boolean) {
    this._logQuery = logQuery;

    return this;
  }

  query(query: Query) {
    this._query = query;

    return this;
  }

  map<Z extends (T extends undefined ? unknown : T),
    Y = T extends undefined ? Z : T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  >(_map: (item: any, i: number) => Z | Promise<Z>): Db<Y> {
    this._map = _map;

    return this as unknown as Db<Y>;
  }

  type(type: OutputVarType): Db<T> {
    this._outputVarType = type;

    return this;
  }

  async _buildCursor(cursorOuput: OutputCursorType) {
    const queryStream = cursorOuput.toQueryStream();
    const { metaData } = cursorOuput;

    const columnMap = mapColumn(metaData);

    this._query.columns = columnMap;

    const rowMap: {[id: string]: unknown}[] = [];

    return new Promise((resolve, reject) => {
      let i = 0;

      queryStream.on('data', async (row: Array<Obj>) => {
        const _row = row
          .map((v, j) => ({
            [columnMap[j]]: v,
          }))
          .reduce(
            (acc, v) => ({ ...acc, ...v }),
            {},
          );

        rowMap.push(this._map.call(this, _row, i));

        i += 1;
      });
      queryStream.on('error', reject);
      queryStream.on('end', async () => {
        resolve(await Promise.all(rowMap));
      });
    });
  }

  // fix - execCursor can return Array of tuple to resolve chart data
  // or Array of Dto as default behavior
  async execCursor(): Promise<T extends [unknown, ...unknown[]] ? T[] : (T extends unknown[] ? T : T[])> {
    this._outputVarType = oracledb.CURSOR;
    this._outputVarName = 'cursor';

    const connection = await Db._pool.getConnection();

    let res;
    try {
      res = await this._buildCursor(await this._exec(connection));
    } finally {
      await connection.release();
    }

    return res as T extends [unknown, ...unknown[]] ? T[] : (T extends Array<unknown> ? T : T[]);
  }

  async execBlob(): Promise<T> {
    this._outputVarType = oracledb.BLOB;

    const connection = await Db._pool.getConnection();

    let data;

    try {
      const res = await this._exec(connection);
      data = await res?.getData();
    } finally {
      await connection.release();
    }

    return data;
  }

  async execClob(): Promise<string> {
    this._outputVarType = oracledb.CLOB;

    const connection = await Db._pool.getConnection();

    let data = '';
    try {
      const res = await this._exec(connection);
      data = await res?.getData() || '';
      data = this._map.call(this, data, 0);
    } finally {
      await connection.release();
    }

    return data;
  }

  async exec(): Promise<T> {
    const connection = await Db._pool.getConnection();

    let res;
    try {
      const rawResult = await this._exec(connection);
      res = this._map.call(this, rawResult, 0);
    } finally {
      await connection.release();
    }

    return res as T;
  }

  static release() {
    return oracledb.getPool().close();
  }

  static async init(dbInit: DbInit) {
    if (Db._pool) {
      await Db.release();
    }

    Db._pool = await oracledb.createPool({
      user: dbInit.credentials.user,
      password: dbInit.credentials.password,
      connectString: dbInit.credentials.connectString,
    });

    if (dbInit.onExec) {
      Db.onExec = dbInit.onExec;
    }
  }

  async _exec(connection: oracledb.Connection) {
    if (!this._query) {
      throw Error('No query to exec');
    }

    this._query.outputName = this._outputVarName;

    if (!this._query) {
      throw Error('No query to exec');
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    let result: oracledb.Result<Partial<{ res: any; cursor: any }>>;
    /* eslint-enable */

    const queryStr = this._query.toString();
    try {
      // specific behavior for clob as param
      // extract Readable params from list of params
      const clobs: { [id: string]: Readable } = {};
      const params: { [id: string]: unknown } = {};

      Object.keys(this._query.bindVars).forEach((key) => {
        if (this._query.bindVars[key] instanceof Readable) {
          clobs[key] = this._query.bindVars[key];
        } else {
          params[key] = this._query.bindVars[key];
        }
      });

      // clobs have to be mapped as Promise<oracle.Lob>
      const makingClobs = newClobs(connection, clobs);
      const resolvedClobs: { [id: string]: Lob } = {};

      const clobsPromises: Array<Promise<Lob>> = [];
      Object.keys(makingClobs).forEach((key) => {
        clobsPromises.push(makingClobs[key]);
        makingClobs[key].then((clob) => {
          resolvedClobs[key] = clob;
        });
      });

      const clobList = await Promise.all(clobsPromises);

      const options = {
        [String(this._outputVarName)]: {
          dir: oracledb.BIND_OUT,
          type: this._outputVarType,
          maxSize: 4000,
        },
        ...params,
        ...resolvedClobs,
      } as BindParameters;

      result = await connection.execute(queryStr, options, {
        autoCommit: true,
      });

      // close clob is deprecated, destroy instead
      await Promise.all(clobList.map((clob) => clob.destroy()));
    } catch (e) {
      throw new DbError(e as Error, this._query);
    }

    return Db.onExec(this, result.outBinds?.[this._outputVarName]);
  }
}

export default function <T = undefined>(userName: string) {
  return new Db<T>(userName);
}

export {
  Db,
  dbTypes,
};

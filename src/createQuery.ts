import { Readable } from 'node:stream';
import type { Obj } from './types';
import { protectValue } from './_base/utils';
import { mapAndProtect as mapper } from './mapper';

export interface Query<T = Obj> {
  bindVars: Obj;

  outputName: 'res' | 'cursor';

  toString: () => string;

  columns: (keyof T)[];
}

class UnsecurePLSql implements Query {
  constructor(queryStr: string) {
    this._query = queryStr;
  }

  _query: string;

  // will be protected by `oracledb`
  bindVars = {};

  outputName: Query['outputName'] = 'cursor';

  columns = [];

  toString(): string {
    return this._query;
  }
}

class PLSql implements Query {
  _pkg: string;

  _func: string;

  // will be protected by `createQuery`
  _params: Obj = {};

  // will be protected by `oracledb`
  _bindVars: Obj = {};

  //  list of variable assigned to a type
  // ({ type: 'my_var' })
  _declare: Record<string, string>;

  get bindVars() {
    return this._bindVars;
  }

  outputName: 'res' | 'cursor' = 'res';

  columns = [];

  static recursiveParse(params: Obj, parent = ''): string[] {
    let res: (Obj | string)[];
    if (Array.isArray(params)) {
      res = params.map((p, i) => PLSql.recursiveParse(p, `${parent}(${i})`));
    } else if (params && typeof params === 'object') {
      res = Object.keys(params).map((k) => PLSql.recursiveParse(params[k], parent ? `${parent}.${k}` : k));
    } else {
      // fix coerced string
      res = [[parent, ':=', params].join(' ')];
    }

    return (res.reduce((acc, val) => acc.concat(val) as string, [])) as string[];
  }

  static getDeclaredPart(query: PLSql) {
    // save type to retrieve easier variable name
    const map = new Map<string, string>();

    const declarePart = query._declare;
    const pkg = query._pkg;

    let queryDeclare = 'DECLARE';
    let queryBegin = 'BEGIN ';

    // build the BEGIN part, create a map
    let varIndice = 0;
    Object.keys(declarePart).forEach((type) => {
      const hasPkg = type.search(/\./) > -1;
      const fullType = (hasPkg ? '' : `${pkg}.`) + type;

      map.set(declarePart[type].toUpperCase(), `var_${varIndice}`);
      queryDeclare += ` var_${varIndice} ${fullType};`;
      varIndice += 1;
    });

    const queryParams: Obj = {};
    // it's not possible to have declare with list of string
    if (query._params && typeof query._params === 'object' && !Array.isArray(query._params)) {
      Object.keys(query._params).forEach((param) => {
        const declared = map.get(param.toUpperCase());
        if (declared) {
          queryParams[param] = declared;
        }
      });

      // rename parameters if it's a declared
      if (typeof query._params === 'object' && !Array.isArray(query._params)) {
        const renamedParams = { ...query._params };
        Object.keys(query._params).forEach((param) => {
          if (queryParams[param]) {
            renamedParams[queryParams[param]] = renamedParams[param];
          }
          delete renamedParams[param];
        });

        const renamedParamsStr = PLSql.recursiveParse(renamedParams).join('; ');
        queryBegin += renamedParamsStr ? `${renamedParamsStr};` : '';
      }
    }

    return {
      queryDeclare,
      queryBegin,
      queryParams,
    };
  }

  declare(dec: Record<string, string>) {
    this._declare = dec;

    return this;
  }

  func(func: string) {
    this._func = func;

    return this;
  }

  pkg(pkg: string) {
    this._pkg = pkg;

    return this;
  }

  /**
   * If a Buffer is used, all parameters have to be declared as "bind"
   */
  params(params: Obj | unknown[] = {}) {
    let _params = params;
    if (Array.isArray(_params)) {
      this._params = _params;
      return this;
    }
    _params = mapper(_params, Object, true);
    if (!Array.isArray(_params)) {
      Object.keys(_params).forEach((paramKey) => {
        if (typeof _params === 'object' && !Array.isArray(_params) && typeof _params[paramKey] !== 'undefined') {
          if (_params[paramKey] instanceof Buffer || _params[paramKey] instanceof Readable) {
            this._bindVars[paramKey] = _params[paramKey];
          } else if (typeof this._params === 'object') {
            this._params[paramKey] = _params[paramKey];
          }
        }
      });
    }

    return this;
  }

  toString() {
    let query = '';

    let queryBegin = 'BEGIN';
    let queryDeclare = '';
    let queryParams: Obj = {};

    // declare part

    if (this._declare) {
      ({ queryDeclare, queryBegin, queryParams } = PLSql.getDeclaredPart(this));
    }

    const queryDeclaredKeyParams = Object.keys(queryParams);

    if (queryDeclare) {
      query += `${queryDeclare} `;
    }

    // avoid useless space
    query += `${queryBegin.trim()} `;

    // res part
    query += `:${this.outputName} := ${this._pkg}.${this._func}(`;

    // it's not possible to have declare with list of string
    // merge declare and un declared params
    if (typeof this._params === 'object' && !Array.isArray(this._params)) {
      const initial: string[] = [];
      const paramsPart = [
        // parse only un declared params
        ...Object.keys(this._params)
          .filter((key) => !queryDeclaredKeyParams.includes(key))
          .reduce((a, b) => {
            if (typeof this._params === 'object') {
              // fix coerced string
              a.push([b, '=>', this._params[b]].join(' '));
            }

            return a;
          }, initial),
        // parse only declared params
        ...queryDeclaredKeyParams.map((decKeyParam) => `${decKeyParam} => ${queryParams[decKeyParam]}`),
        ...Object.keys(this._bindVars).map((attr) => (`${attr} => :${attr}`)),
      ];

      query += paramsPart.join(', ');
    } else if (Array.isArray(this._params)) {
      query += this._params.map((v) => String(protectValue(v))).join(', ');
    } else if (this._params) {
      query += String(protectValue(this._params));
    }

    query += '); ';

    // end part
    query += 'END;';

    // params
    return query;
  }
}

export default function () {
  return new PLSql();
}

const createUnsecureQuery = (queryStr: string) => new UnsecurePLSql(queryStr);

export {
  PLSql,
  createUnsecureQuery,
};

import { Readable } from 'stream';
import type { Obj } from './types';
import { isMobileNumber, isNumeric } from './_base/utils';
import { camelcaseToKebabCase } from './_base/str';
import mapper from './mapper';

export interface Query {
  bindVars: Obj;

  outputName: 'res' | 'cursor';

  toString(): string;

  columns: Array<string>;
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
  _declare: {
    [id: string]: string,
  };

  get bindVars() {
    return this._bindVars;
  }

  outputName: 'res' | 'cursor' = 'res';

  columns = [];

  static recursiveParse(params: Obj, parent = ''): Array<string> {
    let res: Array<Obj | string>;
    if (Array.isArray(params)) {
      res = params.map((p, i) => PLSql.recursiveParse(p, `${parent}(${i})`));
    } else if (params && typeof params === 'object') {
      res = Object.keys(params).map((k) => PLSql.recursiveParse(params[k], parent ? `${parent}.${k}` : k));
    } else {
      // fix coerced string
      res = [[parent, ':=', PLSql.protectValue(params)].join(' ')];
    }

    return res.reduce((acc, val) => acc.concat(val), []);
  }

  static getDeclaredPart(query: PLSql) {
    // save type to retrieve easier variable name
    const map: Map<string, string> = new Map();

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

        const renamedParamsStr = `${PLSql.recursiveParse(renamedParams).join('; ')}`;
        queryBegin += renamedParamsStr ? `${renamedParamsStr};` : '';
      }
    }

    return {
      queryDeclare,
      queryBegin,
      queryParams,
    };
  }

  static protectValue(toProtect: null | string | boolean | number) {
    if (toProtect === null) {
      return 'NULL';
    }

    if (isMobileNumber(toProtect)) {
      return `'${String(toProtect)}'`;
    }

    if (isNumeric(toProtect)) {
      return +toProtect;
    }

    const toProtectStr = String(toProtect);

    // Don t use quote for Date
    const patterDate = /^TO_DATE\('[0-9-]+',( )?'[A-Z-]+'\)/;
    const matchesDate = toProtectStr.match(patterDate);

    // don t use quote for valid json
    let isJson = false;

    if (typeof toProtect === 'string') {
      // if the parse fail, set raw value
      try {
        JSON.parse(toProtect);
        isJson = true;
      } catch (e) {
        isJson = false;
      }
    }

    if (!matchesDate && typeof toProtect === 'string' && !isJson) {
      toProtect = `'${toProtect.replace(/'/g, '\'\'')}'`;
    }

    if (isJson && typeof toProtect === 'string') {
      toProtect = `'${toProtect.replace(/'/g, '\'\'')}'`;
    }

    if (typeof toProtect === 'boolean') {
      toProtect = toProtect === true ? 'TRUE' : 'FALSE';
    }

    return toProtect;
  }

  declare(dec: { [id: string]: string }) {
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
  params(params: Obj | Array<unknown> = {}) {
    if (Array.isArray(params)) {
      this._params = params;
      return this;
    }
    params = mapper(params, Object, true);
    if (!Array.isArray(params)) {
      Object.keys(params).forEach((paramKey) => {
        if (typeof params === 'object' && !Array.isArray(params) && typeof params[paramKey] !== 'undefined') {
          if (params[paramKey] instanceof Buffer || params[paramKey] instanceof Readable) {
            this._bindVars[paramKey] = params[paramKey];
          } else if (typeof this._params === 'object') {
            this._params[paramKey] = params[paramKey];
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
      const initial: Array<string> = [];
      const paramsPart = [
        // parse only un declared params
        ...Object.keys(this._params)
          .filter((key) => queryDeclaredKeyParams.indexOf(key) === -1)
          .reduce((a, b) => {
            let funcName = '';
            // transform function parameter to plsql function
            // parrPrmnDskId: function tArrNumber() { return [0, 1, 2]; },
            // to
            // parr_prmn_dsk_id => t_arr_number (0, 1, 2, 3)
            if (typeof this._params[b] === 'function') {
              let p = this._params[b]();

              funcName = camelcaseToKebabCase(this._params[b].name.replace('_', '.'));

              let alreadyProtected = false;
              if (!Array.isArray(p)) {
                if (typeof p === 'object') {
                  p = (Object.keys(p) as string[]).reduce((acc, v) => {
                    acc.push(`${camelcaseToKebabCase(v)} => ${PLSql.protectValue(p[v])}`);

                    return acc;
                  }, [] as string[]);

                  alreadyProtected = true;
                } else {
                  p = [p];
                }
              }

              // fix coerced string
              const funcParams = alreadyProtected
                ? p.join(', ')
                : p.map(PLSql.protectValue).join(', ');

              a.push([b, '=>', `${funcName}(${funcParams})`].join(' '));
            } else if (typeof this._params === 'object') {
              // fix coerced string
              a.push([b, '=>', PLSql.protectValue(this._params[b])].join(' '));
            }

            return a;
          }, initial),
        // parse only declared params
        ...queryDeclaredKeyParams.map((decKeyParam) => `${decKeyParam} => ${queryParams[decKeyParam]}`),
        ...Object.keys(this._bindVars).map((attr) => (`${attr} => :${attr}`)),
      ];

      query += paramsPart.join(', ');
    } else if (Array.isArray(this._params)) {
      query += this._params.map((v) => String(PLSql.protectValue(v))).join(', ');
    } else if (this._params) {
      query += String(PLSql.protectValue(this._params));
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

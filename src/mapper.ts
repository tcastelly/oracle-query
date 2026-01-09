import { Readable } from 'node:stream';
import type { Class, Obj } from './types';
import { camelcaseToKebabCase, kebabCaseToCamelcase } from './_base/str';
import { isDate, protectValue } from './_base/utils';

type Map = typeof camelcaseToKebabCase;

const isNeedMapKey = (key: string, map: Map) => {
  // fix KebabCase with only one word: eg: STS
  if ((key.match(/[A-Z]+/g) || [])[0] === key.toUpperCase()) {
    return true;
  }

  const indexOf = String(key).lastIndexOf('_');

  // if already in kebabCase don't map in kebabCase
  if (key && map === camelcaseToKebabCase && (indexOf > -1)) {
    return false;
  }

  // if already in camelcasae
  return !(key && map === kebabCaseToCamelcase && (indexOf === -1));
};

const _recursiveParse = (map: Map, protect: (v: unknown) => unknown, params: Obj, key?: string) => {
  let res: Obj = {};

  if (Array.isArray(params)) {
    let newK = String(key);

    // It's not possible to use a private attr
    if (newK.startsWith('_')) {
      newK = newK.substring(1);
    }

    newK = String(isNeedMapKey(newK, map) ? map(newK) : key);
    if (map === camelcaseToKebabCase) {
      newK = newK.toUpperCase();
    }

    const value = params.map((p) => _recursiveParse(map, protect, p));
    if (value !== undefined) {
      res[newK] = value;
    }
  } else if (
    params
    && !isDate(params)
    && !(params instanceof Buffer || params instanceof Readable)
    && typeof params === 'object'
  ) {
    Object.keys(params).forEach((k) => {
      const s = _recursiveParse(map, protect, params[k], k);
      let newK = k;

      newK = isNeedMapKey(newK, map) ? map(newK) : k;

      if (map === camelcaseToKebabCase) {
        newK = newK.toUpperCase();
      }

      if (newK && s[newK] !== undefined) {
        // transform function parameter to plsql function
        // parrPrmnDskId: function tArrNumber() { return [0, 1, 2]; },
        // to
        // parr_prmn_dsk_id => t_arr_number (0, 1, 2, 3)
        if (typeof s[newK] === 'function') {
          let p = s[newK]();

          let funcName = '';
          funcName = camelcaseToKebabCase(s[newK].name.replace('_', '.'));

          let alreadyProtected = false;
          if (!Array.isArray(p)) {
            if (typeof p === 'object') {
              p = (Object.keys(p)).reduce<string[]>((acc, v) => {
                acc.push(`${camelcaseToKebabCase(v)} => ${protect(p[v])}`);

                return acc;
              }, []);

              alreadyProtected = true;
            } else {
              p = [p];
            }
          }

          // fix coerced string
          const funcParams = alreadyProtected
            ? p.join(', ')
            : p.map(protect).join(', ');

          res[newK] = `${funcName}(${funcParams})`;
        } else if (!Array.isArray(s[newK]) && (typeof s[newK] !== 'object' || s[newK] === null)) {
          res[newK] = protect(s[newK]);
        } else {
          res[newK] = s[newK];
        }
      }
    });

    // fix first lvl of object
    if (key) {
      let newK = key;
      newK = isNeedMapKey(newK, map) ? map(newK) : key;

      // fix `declared` param
      if (/_/.exec(newK)) {
        newK = newK.toUpperCase();
      }
      return { [String(newK)]: res };
    }
  } else if (key !== undefined) {
    let newK = key;

    if (newK.startsWith('_')) {
      newK = newK.substring(1);
    }

    newK = isNeedMapKey(newK, map) ? map(newK) : key;

    if (map === camelcaseToKebabCase) {
      newK = newK.toUpperCase();
    }

    if (params !== undefined) {
      res[newK] = params;
    }
  } else if (typeof params !== 'object') {
    res = protect(params) as Obj;
  } else {
    res = params;
  }

  return res;
};

const recursiveMapParse = _recursiveParse.bind(null, kebabCaseToCamelcase);

const recursiveReverseParse = _recursiveParse.bind(null, camelcaseToKebabCase);

// @ts-ignore, allow Object as default class
const mapper = <T>(obj: unknown, Cls: Class<T> = Object, reverse = false) => {
  const mapObj = reverse ? recursiveReverseParse((v) => v, obj as Obj) : recursiveMapParse((v) => v, obj as Obj);

  const _obj = new Cls();

  Object.keys(mapObj).forEach((attr) => {
    // @ts-ignore - allow merge obj
    _obj[attr] = mapObj[attr];
  });
  return _obj;
};

// @ts-ignore, allow Object as default class
const mapAndProtect = <T>(obj: unknown, Cls: Class<T> = Object, reverse = false) => {
  const mapObj = reverse ? recursiveReverseParse(protectValue, obj as Obj) : recursiveMapParse(protectValue, obj as Obj);

  const _obj = new Cls();

  Object.keys(mapObj).forEach((attr) => {
    // @ts-ignore - allow merge obj
    _obj[attr] = mapObj[attr];
  });
  return _obj;
};

export {
  mapper,
  mapAndProtect,
};

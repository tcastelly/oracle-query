import { Readable } from 'stream';
import type { Obj, Class } from './types';
import { camelcaseToKebabCase, kebabCaseToCamelcase } from './_base/str';
import { isDate } from './_base/utils';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _recursiveParse = (map: Map, params: any, key?: string) => {
  let res: Obj = {};
  if (Array.isArray(params)) {
    let newK = String(key);

    // It's not possible to use a private attr
    if (newK.substring(0, 1) === '_') {
      newK = newK.substring(1);
    }

    newK = String(isNeedMapKey(newK, map) ? map(newK) : key);
    if (map === camelcaseToKebabCase) {
      newK = newK.toUpperCase();
    }

    const value = params.map((p) => _recursiveParse(map, p));
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
      const s = _recursiveParse(map, params[k], k);
      let newK = k;

      newK = isNeedMapKey(newK, map) ? map(newK) : k;

      if (map === camelcaseToKebabCase) {
        newK = newK.toUpperCase();
      }

      if (newK && s[newK] !== undefined) {
        res[newK] = s[newK];
      }
    });

    // fix first lvl of object
    if (key) {
      let newK = key;
      newK = isNeedMapKey(newK, map) ? map(newK) : key;
      return { [String(newK)]: res };
    }
  } else if (key !== undefined) {
    let newK = key;

    if (newK.substring(0, 1) === '_') {
      newK = newK.substring(1);
    }

    newK = isNeedMapKey(newK, map) ? map(newK) : key;

    if (map === camelcaseToKebabCase) {
      newK = newK.toUpperCase();
    }

    if (params !== undefined) {
      res[newK] = params;
    }
  } else {
    res = params;
  }

  return res;
};
const recursiveMapParse = _recursiveParse.bind(null, kebabCaseToCamelcase);
const recursiveReverseParse = _recursiveParse.bind(null, camelcaseToKebabCase);

// @ts-ignore, allow Object as default class
const mapper = <T>(obj: unknown, Cls: Class<T> = Object, reverse = false) => {
  const mapObj = reverse ? recursiveReverseParse(obj) : recursiveMapParse(obj);

  const _obj = new Cls();

  Object.keys(mapObj).forEach((attr) => {
    // @ts-ignore - allow merge obj
    _obj[attr] = mapObj[attr];
  });
  return _obj;
};

export default mapper;

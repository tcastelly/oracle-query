const isDate = (d: Date | string | object | number) => Object.prototype.toString.call(d) === '[object Date]';

const isNumeric = (n: string | number | boolean) => n !== ''
  && typeof n !== 'boolean'
  && !Number.isNaN(+n)
  && !String(n).startsWith('+');

const isMobileNumber = (n: unknown) => n !== ''
  && typeof n === 'string'
  && !!(/^[+]?([0-9]*[.\s\-()]|[0-9]+){3,24}$/.exec(String(n)));

const protectValue = (toProtect: null | string | boolean | number) => {
  let _toProtect = toProtect;

  if (_toProtect === null) {
    return 'NULL';
  }

  if (isMobileNumber(_toProtect)) {
    return `'${String(_toProtect)}'`;
  }

  if (isNumeric(_toProtect)) {
    return +_toProtect;
  }

  const toProtectStr = String(_toProtect);

  // Don t use quote for Date
  const patterDate = /^TO_DATE\('[0-9-]+',( )?'[A-Z-]+'\)/;
  const matchesDate = patterDate.exec(toProtectStr);

  // don t use quote for valid json
  let isJson = false;

  if (typeof _toProtect === 'string') {
    // if the parse fail, set raw value
    try {
      JSON.parse(_toProtect);
      isJson = true;
    } catch (e) {
      isJson = false;
    }
  }

  if (!matchesDate && typeof _toProtect === 'string' && !isJson) {
    _toProtect = `'${_toProtect.replace(/'/g, '\'\'')}'`;
  }

  if (isJson && typeof _toProtect === 'string') {
    _toProtect = `'${_toProtect.replace(/'/g, '\'\'')}'`;
  }

  if (typeof _toProtect === 'boolean') {
    _toProtect = _toProtect ? 'TRUE' : 'FALSE';
  }

  return _toProtect;
};

export {
  isDate,
  isNumeric,
  isMobileNumber,
  protectValue,
};

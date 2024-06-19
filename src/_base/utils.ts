const isDate = (d: Date | string | object | number) => Object.prototype.toString.call(d) === '[object Date]';

const isNumeric = (n: string | number | boolean) => n !== ''
  && typeof n !== 'boolean'
  && !Number.isNaN(+n)
  && String(n).substring(0, 1) !== '+';

const isMobileNumber = (n: unknown) => n !== ''
  && typeof n === 'string'
  && !!String(n).match(/^[+]?([0-9]*[.\s\-()]|[0-9]+){3,24}$/);

const protectValue = (toProtect: null | string | boolean | number) => {
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
};

export {
  isDate,
  isNumeric,
  isMobileNumber,
  protectValue,
};

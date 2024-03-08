const isDate = (d: Date | string | object | number) => Object.prototype.toString.call(d) === '[object Date]';

const isNumeric = (n: string | number | boolean) => n !== ''
  && typeof n !== 'boolean'
  && !Number.isNaN(+n)
  && String(n).substring(0, 1) !== '+';

const isMobileNumber = (n: unknown) => n !== ''
  && typeof n === 'string'
  && !!String(n).match(/^[+]?([0-9]*[.\s\-()]|[0-9]+){3,24}$/);

export {
  isDate,
  isNumeric,
  isMobileNumber,
};

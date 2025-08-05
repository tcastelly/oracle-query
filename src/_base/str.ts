import { isNumeric } from './utils';

const isUpperCase: (str: string) => boolean = (str) => !isNumeric(str) && str.toUpperCase() === str;

const clear = (str = '') => {
  let _str = str;

  _str = _str
    .trim()
    // replace accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

    // the rest
    .replace(/[^a-zA-Z0-9\-_]/gi, '-')
    .toLowerCase();

  while (_str.search('--') > -1) {
    _str = _str.replace(/--/, '-');
  }

  if (_str.startsWith('-')) {
    _str = _str.substring(1);
  }

  if (_str.endsWith('-')) {
    _str = _str.substring(0, _str.length - 1);
  }
  return _str.trim();
};

const kebabCaseToCamelcase = (str = '', seprator = '_', toLowerCase = true) => {
  let _str = str;
  _str = toLowerCase ? _str
    .toLowerCase() : _str;

  return _str.split(seprator)
    .reduce((a, b) => a + (a ? b.substring(0, 1).toUpperCase() + b.substring(1) : b), '');
};

const camelcaseToKebabCase = (attrCamelcase = '', separator = '_') => {
  let attrUnderscore = '';

  for (let i = 0; i < attrCamelcase.length; i += 1) {
    const attrUnderscoreLength = attrUnderscore.length;
    const char = attrCamelcase[i];
    const isLastChartNumber = i > 0 ? isNumeric(attrUnderscore[attrUnderscoreLength - 1]) : false;
    const isBeforeLastChartUnderscore = i > 1 ? attrUnderscore[attrUnderscoreLength - 2] === separator : false;
    const isCharNumber = isNumeric(char);

    if (
      // prevent underscore as first car
      i > 0
      // default
      && (isUpperCase(char) || (isCharNumber && !isLastChartNumber))
      // fix, only one char (string) between underscore is NOT allowed: eg: DIFF_M01 / CST_FRT_IN_CRNCY_0_TO_100_PCT
      && (!isBeforeLastChartUnderscore || !isCharNumber)
      // fix, not allowed to have an underscore at the second position, only if the char is string: eg: Q1
      && (attrUnderscore.length > 1 || !isCharNumber)
      // fix point
      && char !== '.'
    ) {
      attrUnderscore += separator;
    }

    attrUnderscore += char.toUpperCase();
  }

  return attrUnderscore;
};

export {
  clear,
  isNumeric,
  isUpperCase,
  kebabCaseToCamelcase,
  camelcaseToKebabCase,
};

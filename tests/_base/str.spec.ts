import {
  isUpperCase,
  clear,
  camelcaseToKebabCase,
  kebabCaseToCamelcase,
} from '@/_base/str';

describe('GIVEN an string', () => {
  describe('WHEN test "A" is an uppercase', () => {
    it('THEN it should be', () => {
      expect(isUpperCase('A')).toBe(true);
    });
  });

  describe('WHEN test "b" is an uppercase', () => {
    it('THEN it should not be', () => {
      expect(isUpperCase('b')).toBe(false);
    });
  });

  describe('WHEN test "0" is an uppercase', () => {
    it('THEN it should not be', () => {
      expect(isUpperCase('0')).toBe(false);
    });
  });

  describe('WHEN transform camelcase to kebabcase', () => {
    const attrs = new Map<string, string>([
      ['abcAbcAbAbc0Ab100Abc', 'ABC_ABC_AB_ABC_0_AB_100_ABC'],
      ['abcAbc0AbcAbc', 'ABC_ABC_0_ABC_ABC'],
      ['abcAbc100AbcAbc', 'ABC_ABC_100_ABC_ABC'],
      ['AbcA01', 'ABC_A01'],
      ['a1', 'A1'],
      ['a01', 'A01'],
      ['aAbcdAbcAbcd', 'A_ABCD_ABC_ABCD'],
      ['abcAbc.aAbcAbcdef', 'ABC_ABC.A_ABC_ABCDEF'],
    ]);

    attrs.forEach((value, str) => {
      it(`THEN ${str} the result should be correct`, () => {
        expect(camelcaseToKebabCase(str)).toBe(value);
      });
    });
  });

  describe('WHEN transform kebabcase to camelcase', () => {
    const attrs = new Map<string, string>([
      ['ABC_ABC_AB_ABCDE_0_AB_100_ABC', 'abcAbcAbAbcde0Ab100Abc'],
      ['ABC_ABC_0_ABC_ABC', 'abcAbc0AbcAbc'],
      ['ABC_ABC_100_ABC_ABC', 'abcAbc100AbcAbc'],
      ['ABCD_A01', 'abcdA01'],
      ['A1', 'a1'],
      ['A01', 'a01'],
      ['A_ABCD_ABC_ABCD', 'aAbcdAbcAbcd'],
    ]);

    attrs.forEach((value, str) => {
      it(`THEN ${str} the result should be correct`, () => {
        expect(kebabCaseToCamelcase(str)).toBe(value);
      });
    });
  });

  describe('WHEN clean string', () => {
    it('THEN result should be clear', () => expect(
      clear('$Hey VueJS is wonderful !! But I prefer with TS ...'),
    ).toBe('hey-vuejs-is-wonderful-but-i-prefer-with-ts'));

    it('THEN accent should be removed', () => expect(clear('àáâèéçņôóò')).toBe('aaaeecnooo'));
  });
});

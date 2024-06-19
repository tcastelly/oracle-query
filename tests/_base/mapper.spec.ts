import map from '@/mapper';

class ItemDto {
  id: unknown;

  lbl: unknown;
}

class SampleDto {}

describe('GIVEN an Object to map', () => {
  describe('WHEN map', () => {
    const obj = {
      id: undefined,
      STS: 'DFT',
      first_param: 'OK',
      secondParam: 'OK',
      thirstParam: {
        sub_param: 'OK2',
        sub_param2: {
          sub_sub_sub_param: 'ok3',
          arr2: [6, 7, 8, 9],
        },
        last: { is_finished: true },
      },
      arr: [{ id: 1, cd: 'A', descr: 'One' }],
    };

    const res = map(obj);

    it('THEN only camelcase should exist', () => {
      expect(JSON.stringify(res)).toBe(JSON.stringify({
        sts: "'DFT'",
        firstParam: "'OK'",
        secondParam: "'OK'",
        thirstParam: {
          subParam: "'OK2'",
          subParam2: {
            subSubSubParam: "'ok3'",
            arr2: [6, 7, 8, 9],
          },
          last: { isFinished: 'TRUE' },
        },
        arr: [{ id: 1, cd: "'A'", descr: "'One'" }],
      }));
    });
  });

  describe('WHEN reverse map', () => {
    const obj = {
      FIRST_PARAM: 'OK',
      secondParam: 'OK',
      arr: [{ id: 1, cd: 'A', descr: 'One' }],
    };
    const res = map(obj, Object, true);
    it('THEN only kebabcase should exist', () => {
      expect(JSON.stringify(res)).toBe(JSON.stringify({
        FIRST_PARAM: "'OK'",
        SECOND_PARAM: "'OK'",
        ARR: [{ ID: 1, CD: "'A'", DESCR: "'One'" }],
      }));
    });
  });

  describe('WHEN map array', () => {
    const obj = { parr_nr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] };
    const res = map(obj, Object, true);
    it('THEN only kebabcase should exist', () => {
      expect(JSON.stringify(res)).toBe(JSON.stringify({
        PARR_NR: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      }));
    });
  });

  describe('WHEN map obj with undefined attr', () => {
    const attr = undefined;
    const obj = {
      attr,
    };
    const res = map(obj);
    it('THEN the answer should be an empty object', () => {
      expect(JSON.stringify(res)).toBe(JSON.stringify({}));
    });
  });

  describe('WHEN map Dto', () => {
    const idLabel = { id: 1, lbl: 'one' };
    const res = map(idLabel, ItemDto);
    it('THEN Dto has to be instantiated', () => {
      expect(res instanceof ItemDto).toBe(true);
    });
    it('AND attributes mapped', () => {
      expect(idLabel.id).toBe(res.id);
      expect(`'${idLabel.lbl}'`).toBe(res.lbl);
    });
  });

  describe('WHEN map inherited Dto', () => {
    const inDto = {
      id: 42,
      ok: 1,
      ko: 0,
      parentAttr: 'im the parent',
      items: [],
    };
    const res = map(inDto, SampleDto);
    it('THEN Dto has to be instantiated', () => {
      expect(res instanceof SampleDto).toBe(true);
    });
    it('AND all attributes have to be map', () => {
      expect(Object.keys(res)).toEqual(
        expect.arrayContaining(Object.keys(inDto)),
      );
    });
  });
});

import { dbDate, dto } from '../../../src/_base';
import SampleDto, { ItemDto } from '../SampleDto';

describe('GIVEN a Dto', () => {
  let ProductDto;
  beforeAll(async () => {
    const ParentDto = dto(class {
      @dbDate
      dt;

      @dbDate
      dt2;
    });
    ProductDto = dto(class {
      nm;

      @dbDate
      defaultDt = '2022-09-21';
    }, ParentDto);
  });

  describe('WHEN set an existing attribute', () => {
    let product;
    beforeAll(async () => {
      product = new ProductDto();
      product.nm = '#1';
      product.dt = '2019-11-25';
      product.dt2 = 'TO_DATE(\'2019-11-25\', \'YYYY-MM-DD\')';
    });

    describe('WHEN list attributes', () => {
      let attrs;
      beforeAll(async () => {
        attrs = Object.keys(product);
      });
      it('THEN all attr keys should be retrieved', () => {
        expect(JSON.stringify(attrs)).toBe(JSON.stringify(['defaultDt', 'dt', 'dt2', 'nm']));
      });
    });

    it('THEN the attribute should be a number', () => {
      expect(product.nm).toBe('#1');
    });

    it('AND the dt attribute should be decorated', () => {
      expect(product.dt).toBe('TO_DATE(\'2019-11-25\', \'YYYY-MM-DD\')');
    });

    it('AND the dt2 attribute should not be decorated', () => {
      expect(product.dt2).toBe('TO_DATE(\'2019-11-25\', \'YYYY-MM-DD\')');
    });

    it('AND the default date should be decorated', () => {
      expect(product.defaultDt).toBe('TO_DATE(\'2022-09-21\', \'YYYY-MM-DD\')');
    });
  });

  describe('WHEN try to assign non existing attribute', () => {
    let product;

    beforeAll(async () => {
      product = new ProductDto();
      product.nm2 = 'My Product';
    });

    it('THEN attributes should not be set', () => {
      expect(product.nm2).toBe(undefined);
    });
  });

  describe('WHEN clone a dto', () => {
    let sample;
    let cloned;

    beforeAll(async () => {
      sample = new SampleDto({
        id: 42,
        ok: 1,
        ko: 0,
        password: 'mysecretpassword',
        items: [
          new ItemDto({ id: 1, lbl: 'first item' }),
        ],
      });
      cloned = { ...sample };
    });

    it('THEN all attributes should be preserved', () => {
      expect(cloned.id).toBe(42);
      expect(cloned.ok).toBe(true);
      expect(cloned.ko).toBe(false);
      expect(cloned.password).toBe(undefined);
      expect(JSON.stringify(cloned)).toBe(JSON.stringify({
        items: [{ id: 1, lbl: 'first item' }],
        ok: true,
        ko: false,
        id: 42,
      }));
    });
  });

  describe('WHEN extends a dto', () => {
    let doc;
    beforeAll(async () => {
      doc = new SampleDto({
        parentAttr: 'a parent value',
      });
    });

    it('THEN the extended attr should not be empty', () => {
      expect(doc.parentAttr).toBe('a parent value');
    });
  });

  describe('WHEN assign property in constructor', () => {
    let sample;

    beforeAll(async () => {
      sample = new SampleDto({
        id: 42,
        ok: 1,
        ko: 0,
        password: 'mysecretpassword',
        items: [
          new ItemDto({ id: 1, lbl: 'first item' }),
        ],
      });
    });

    it('THEN property should be set', () => {
      expect(sample.id).toBe(42);
      expect(sample.ok).toBe(true);
      expect(sample.ko).toBe(false);
      expect(sample.password).toBe('mysecretpassword');
      expect(JSON.stringify(sample)).toBe(JSON.stringify({
        items: [{ id: 1, lbl: 'first item' }],
        ok: true,
        ko: false,
        id: 42,
      }));
      expect(JSON.stringify(Object.keys(sample))).toBe(JSON.stringify([
        'items',
        'ok',
        'ko',
        'parentAttr',
        'id',
      ]));
    });
  });

  // often the client for set an Array<Dto> can pass a class or an Object
  describe('WHEN assign dto properties in constructor', () => {
    let sampleDto;

    // mix object and class
    beforeAll(async () => {
      const itemDto1 = new ItemDto({ id: 1, lbl: 'lbl: 1' });
      const itemDto2 = { id: 2, lbl: 'lbl: 2' };
      sampleDto = new SampleDto({
        items: [itemDto1, itemDto2],
      });
    });

    it('THEN property should be map to ItemDto', () => {
      expect(sampleDto.items.length).toBe(2);
      sampleDto.items.forEach((item) => {
        expect(item instanceof ItemDto).toBe(true);
      });
    });
  });

  describe('WHEN destructure a Dto', () => {
    let json;
    let _dto;

    beforeAll(async () => {
      _dto = new SampleDto({ id: 42 });
      json = { ..._dto };
    });

    it('THEN dto should be destructured', () => {
      expect(JSON.stringify(json)).toBe(JSON.stringify({
        items: [],
        ok: null,
        ko: null,
        id: 42,
      }));
    });

    describe('WHEN get typeof dto', () => {
      let t;
      let i;
      beforeEach(() => {
        t = typeof _dto;
        i = _dto instanceof SampleDto;
      });

      it('THEN type should be an object', () => {
        expect(t).toBe('object');
      });
      it('AND instanceof should be SampleDto', () => {
        expect(i).toBe(true);
      });
    });
  });
});

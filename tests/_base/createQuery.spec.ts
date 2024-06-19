import { PLSql, createQuery } from '@/index';
import { protectValue } from '@/_base/utils';

describe('GIVEN createQuery', () => {
  describe('GIVEN a value', () => {
    describe('WHEN protec the value', () => {
      it('THEN number should not be protect', () => {
        expect(protectValue(1)).toBe(1);
      });
      it('AND stringified number should not be protect', () => {
        expect(protectValue('1')).toBe(1);
      });
      it('AND string should be protected', () => {
        expect(protectValue('toto')).toBe('\'toto\'');
      });
      it('AND mobile phone should be protected', () => {
        expect(protectValue('+41 (0) 44 123 12 34')).toBe('\'+41 (0) 44 123 12 34\'');
      });
      it('AND boolean should not be protected', () => {
        expect(protectValue(true)).toBe('TRUE');
      });
      it('AND "numeric" string start with "+"', () => {
        expect(protectValue('+91 01 23 45 67 89')).toBe('\'+91 01 23 45 67 89\'');
      });
      it('AND PLSql date should not be protected', () => {
        let plsqlDate = 'TO_DATE(\'2019-10-01\', \'YYYY-MM-DD\')';
        expect(protectValue(plsqlDate)).toBe(plsqlDate);

        plsqlDate = 'TO_DATE(\'20191001\', \'YYYYMMDD\')';
        expect(protectValue(plsqlDate)).toBe(plsqlDate);
      });
      it('AND stringified JSON should be protected', () => {
        expect(protectValue(JSON.stringify({ OK: true }))).toBe('\'{"OK":true}\'');
      });
    });
  });

  describe('GIVEN a simple query', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg_test')
          .func('func_name');
      });

      it('THEN the query built should be correct', () => {
        const resExpected = 'BEGIN :res := pkg_test.func_name(); END;';
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN query with string param', () => {
    let query: PLSql;
    describe('WHEN build it', () => {
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg')
          .func('get_something')
          .params(['tcastelly']);
      });

      it('THEN the query built should be correct', () => {
        const resExpected = 'BEGIN :res := pkg.get_something(\'tcastelly\'); END;';
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN query with multiple string params', () => {
    let query: PLSql;
    describe('WHEN build it', () => {
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg')
          .func('get_something')
          .params(['thomas', 'castelly', 'shen']);
      });

      it('THEN the query built should be correct', () => {
        const resExpected = 'BEGIN :res := pkg.get_something(\'thomas\', \'castelly\', \'shen\'); END;';
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN query with no params', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg_test')
          .func('func_name')
          .params();
      });

      it('THEN the query built should be correct', () => {
        const resExpected = 'BEGIN :res := pkg_test.func_name(); END;';
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN query with null param', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg_test')
          .func('func_name')
          .params({ p: null });
      });

      it('THEN the query built should be correct', () => {
        const resExpected = 'BEGIN :res := pkg_test.func_name(P => NULL); END;';
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN query with number attr in Object', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg_test')
          .func('func_name')
          .params({
            p1: 0,
            p2: 1,
            p3: 'toto',
          });
      });

      it('THEN the query built should be correct', () => {
        const resExpected = 'BEGIN :res := pkg_test.func_name(P1 => 0, P2 => 1, P3 => \'toto\'); END;';
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN query with null attr in Object', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg_test')
          .func('func_name')
          .params({
            p1: 'aa',
            p2: null,
          });
      });

      it('THEN the query built should be correct', () => {
        const resExpected = 'BEGIN :res := pkg_test.func_name(P1 => \'aa\', P2 => NULL); END;';
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN query with string attr in Object', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg_test')
          .func('func_name')
          .params({
            p1: 'aa',
            p2: 'bb',
          });
      });

      it('THEN the query built should be correct', () => {
        const resExpected = 'BEGIN :res := pkg_test.func_name(P1 => \'aa\', P2 => \'bb\'); END;';
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN query with empty array with', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg_api_test')
          .func('sum_integers')
          .declare({ 'pkg.arr_ids': 'ids' })
          .params({ ids: [] });
      });

      it('THEN the query built should be correct', () => {
        const resExpected = 'DECLARE var_0 pkg.arr_ids; BEGIN :res := pkg_api_test.sum_integers(IDS => var_0); END;';
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN a query with declared params as Object', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        const p = { cd: 'ABC', descr: 'Abcdef' };

        query = createQuery()
          .pkg('pkg')
          .func('do_something')
          .declare({ decl_p: 'p' })
          .params({ p, username: 'tcastelly' });
      });

      it('THEN the query built should be correct', () => {
        const resExpected = [
          'DECLARE',
          'var_0 pkg.decl_p;',
          'BEGIN',
          'var_0.CD := \'ABC\';',
          'var_0.DESCR := \'Abcdef\';',
          ':res := pkg.do_something(USERNAME => \'tcastelly\', P => var_0);',
          'END;',
        ].join(' ');
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN a query with declared params as Array<number>', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        const ids = [2];

        query = createQuery()
          .pkg('pkg')
          .declare({ 'pkg.arr_ids': 'ids' })
          .func('do_something')
          .params({
            ids,
          });
      });

      it('THEN the query built should be correct', () => {
        const resExpected = [
          'DECLARE',
          'var_0 pkg.arr_ids;',
          'BEGIN',
          'var_0(0) := 2;',
          ':res := pkg.do_something(IDS => var_0);',
          'END;',
        ].join(' ');
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN a query with declared params as Array<string>', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg')
          .func('search')
          .declare({ arr_tags: 'tags' })
          .params({
            tags: ['ICE', 'BRENT', 'MINUS', 'NYMEX', 'WTI', 'FIRST', 'MONTH'],
          });
      });

      it('THEN the query built should be correct', () => {
        const resExpected = [
          'DECLARE',
          'var_0 pkg.arr_tags;',
          'BEGIN',
          'var_0(0) := \'ICE\';',
          'var_0(1) := \'BRENT\';',
          'var_0(2) := \'MINUS\';',
          'var_0(3) := \'NYMEX\';',
          'var_0(4) := \'WTI\';',
          'var_0(5) := \'FIRST\';',
          'var_0(6) := \'MONTH\';',
          ':res := pkg.search(TAGS => var_0);',
          'END;',
        ].join(' ');
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN a query with declared param as Array<Object>', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg')
          .func('do_something')
          .declare({ arr_products: 'products' })
          .params({
            products: [
              {
                prod_id: 1,
                label: 'toto',
              },
              {
                prod_id: 2,
                label: 'tata',
              },
              {
                prod_id: 3,
                label: 'titi',
              },
            ],
          });
      });

      it('AND the query built should be correct', () => {
        const resExpected = [
          'DECLARE',
          'var_0 pkg.arr_products;',
          'BEGIN',
          'var_0(0).PROD_ID := 1;',
          'var_0(0).LABEL := \'toto\';',
          'var_0(1).PROD_ID := 2;',
          'var_0(1).LABEL := \'tata\';',
          'var_0(2).PROD_ID := 3;',
          'var_0(2).LABEL := \'titi\';',
          ':res := pkg.do_something(PRODUCTS => var_0);',
          'END;',
        ].join(' ');
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN a query with complex declare', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg')
          .func('do_something')
          .declare({
            'pkg.arr_labels': 'labels',
            'pkg.arr_ids': 'ids',
          })
          .params({
            labels: ['ADMIN', 'DFLT'],
            period: 201909,
            ids: [36, 6, 10, 18, 16],
            type: 'M',
          });
      });

      it('THEN the query built should be correct', () => {
        const resExpected = [
          'DECLARE',
          'var_0 pkg.arr_labels;',
          'var_1 pkg.arr_ids;',
          'BEGIN',
          'var_0(0) := \'ADMIN\';',
          'var_0(1) := \'DFLT\';',
          'var_1(0) := 36;',
          'var_1(1) := 6;',
          'var_1(2) := 10;',
          'var_1(3) := 18;',
          'var_1(4) := 16;',
          ':res := pkg.do_something(PERIOD => 201909,',
          'TYPE => \'M\',',
          'LABELS => var_0,',
          'IDS => var_1);',
          'END;',
        ].join(' ');
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN an other query with complex declare', () => {
    describe('WHEN build it', () => {
      let query: PLSql;
      beforeAll(async () => {
        query = createQuery()
          .pkg('pkg')
          .func('search')
          .declare({
            'pkg.arr_types': 'types',
            'pkg.arr_tags': 'tags',
          })
          .params({
            types: ['ADMIN', 'DFLT'],
            tags: ['p1', 'p2'],
          });
      });

      it('THEN the query build should be correct', () => {
        const resExpected = [
          'DECLARE',
          'var_0 pkg.arr_types;',
          'var_1 pkg.arr_tags;',
          'BEGIN',
          'var_0(0) := \'ADMIN\';',
          'var_0(1) := \'DFLT\';',
          'var_1(0) := \'p1\';',
          'var_1(1) := \'p2\';',
          ':res := pkg.search(TYPES => var_0,',
          'TAGS => var_1);',
          'END;',
        ].join(' ');
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN a query to insert a record', () => {
    let query: PLSql;
    beforeAll(async () => {
      const record = {
        id: undefined,
        ref: 'Voyage #1',
        subTp: 'SubType',
        anId: 11859,
        arr: [{
          id: undefined,
          type: 'ENABLED',
        }],
      };

      const username = 'tcastelly';

      query = createQuery()
        .pkg('pkg')
        .func('insert')
        .declare({ product: 'record' })
        .params({ record, username });
    });
    describe('WHEN build it', () => {
      it('THEN the query build should be correct', () => {
        const resExpected = [
          'DECLARE',
          'var_0 pkg.product;',
          'BEGIN',
          'var_0.REF := \'Voyage #1\';',
          'var_0.SUB_TP := \'SubType\';',
          'var_0.AN_ID := 11859;',
          'var_0.ARR(0).TYPE := \'ENABLED\';',
          ':res := pkg.insert(USERNAME => \'tcastelly\',',
          'RECORD => var_0);',
          'END;',
        ].join(' ');
        expect(query.toString()).toBe(resExpected);
      });
    });
  });

  describe('GIVEN query with function as parameter', () => {
    let query: PLSql;

    beforeAll(async () => {
      query = createQuery()
        .pkg('pkg')
        .func('do_something')
        .params({
          arr_ids: function ids() {
            return [0, 1, 2];
          },
        });
    });
    it('THEN the stringify query should be correct', () => {
      expect(query.toString()).toBe('BEGIN :res := pkg.do_something(ARR_IDS => IDS(0, 1, 2)); END;');
    });
  });

  describe('GIVEN query with function as embedded parameter', () => {
    let query: PLSql;

    beforeAll(async () => {
      query = createQuery()
        .pkg('pkg')
        .func('do_something')
        .declare({ decl_p: 'p' })
        .params({
          p: {
            arr_ids: function ids() {
              return [0, 1, 2];
            },
          },
        });
    });
    it('THEN the stringify query should be correct', () => {
      expect(query.toString()).toBe('DECLARE var_0 pkg.decl_p; BEGIN var_0.ARR_IDS := IDS(0, 1, 2); :res := pkg.do_something(P => var_0); END;');
    });
  });

  describe('GIVEN query with function and type as parameter', () => {
    let query: PLSql;

    beforeAll(async () => {
      query = createQuery()
        .pkg('pkg')
        .func('do_something')
        .params({
          arr_ids: function pkgApi_ids() {
            return [0, 1, 2];
          },
        });
    });
    it('THEN the stringify query should be correct', () => {
      expect(query.toString()).toBe('BEGIN :res := pkg.do_something(ARR_IDS => PKG_API.IDS(0, 1, 2)); END;');
    });
  });

  describe('GIVEN a query with function returning an object', () => {
    let query: PLSql;

    beforeAll(async () => {
      query = createQuery()
        .pkg('pkg')
        .func('do_something')
        .params({
          id: function pkgApi_id() {
            return ({
              anId: 3,
              anotherId: 2,
            });
          },
        });
    });
    it('THEN the stringify query should be correct', () => {
      expect(query.toString()).toBe('BEGIN :res := pkg.do_something(ID => '
      + 'PKG_API.ID(AN_ID => 3, ANOTHER_ID => 2)); END;');
    });
  });

  describe('try', () => {
    it('try', () => {
      const q = createQuery()
        .pkg('pkg')
        .func('auth')
        .params({
          username: 'tcy',
          pwd: 'a-password',
        });

      expect(q.toString()).toBe('BEGIN :res := pkg.auth(USERNAME => \'tcy\', PWD => \'a-password\'); END;');
    });
  });
});

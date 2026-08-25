import {
  beforeAll,
  describe,
  expect,
  it,
} from '@jest/globals';
import {
  dbIntBoolean,
  dto,
  number,
} from '../../../src/_base/dto';
import omit from '../../../src/_base/dto/omit.ts';

describe('GIVEN a dto extending an other dto', () => {
  let ChildDto;
  let child;

  beforeAll(() => {
    const ParentDto = dto(class {
      @number
      nb = '542';

      plain;
    });

    ChildDto = dto(class extends ParentDto {
      @dbIntBoolean
      flag = true;

      own;
    });

    child = new ChildDto({
      nb: '999',
      plain: 'p',
      own: 'o',
      flag: true,
    });
  });

  it('THEN the decorated attribute of the parent should be handled', () => {
    expect(child.nb).toBe(999);
  });

  it('THEN the plain attribute of the parent should be handled', () => {
    expect(child.plain).toBe('p');
  });

  it('THEN the decorated attribute of the child should be handled', () => {
    expect(child.flag).toBe(1);
  });

  // regression: the parent proxy used to drop the non decorated fields of the child
  it('THEN the plain attribute of the child should be handled', () => {
    expect(child.own).toBe('o');
  });

  it('THEN every attribute should be serialized', () => {
    expect(JSON.parse(JSON.stringify(child))).toEqual({
      nb: 999,
      plain: 'p',
      own: 'o',
      flag: 1,
    });
  });
});

describe('GIVEN a dto redeclaring an attribute of its parent', () => {
  let child;

  beforeAll(() => {
    const ParentDto = dto(class {
      @number
      val = '1';
    });

    const ChildDto = dto(class extends ParentDto {
      @dbIntBoolean
      val = true;
    });

    child = new ChildDto({ val: true });
  });

  it('THEN the decorator of the child should win over the parent one', () => {
    expect(child.val).toBe(1);
  });
});

describe('GIVEN a dto decorating an attribute declared plain by its parent', () => {
  let child;

  beforeAll(() => {
    const ParentDto = dto(class {
      // no decorator, the parent constructor declares it as an own value
      val;

      kept = 'k';
    });

    const ChildDto = dto(class extends ParentDto {
      @dbIntBoolean
      val;
    });

    child = new ChildDto({ val: true });
  });

  // regression: the own value of the parent used to shadow the accessor of the child
  it('THEN the decorator of the child should be applied', () => {
    expect(child.val).toBe(1);
  });

  it('THEN the other attributes of the parent should be preserved', () => {
    expect(child.kept).toBe('k');
  });
});

describe('GIVEN a dto extending a dto over 3 levels', () => {
  let child;

  beforeAll(() => {
    const A = dto(class {
      @number
      a = '1';
    });

    const B = dto(class extends A {
      @number
      b = '2';
    });

    const C = dto(class extends B {
      @number
      c = '3';

      plain;
    });

    child = new C({ plain: 'z' });
  });

  it('THEN every level should be handled', () => {
    expect(JSON.parse(JSON.stringify(child))).toEqual({
      a: 1,
      b: 2,
      c: 3,
      plain: 'z',
    });
  });
});

describe('GIVEN several mixins declaring different attributes', () => {
  let sample;

  beforeAll(() => {
    const First = dto(class {
      @number
      first = '1';
    });

    const Second = dto(class {
      @number
      second = '2';
    });

    const SampleDto = dto(class {
      own;
    }, First, Second);

    sample = new SampleDto({ own: 'o' });
  });

  // regression: getTarget always looked at targets[0], the 2nd mixin was unreachable
  it('THEN each mixin should be reachable', () => {
    expect(sample.first).toBe(1);
    expect(sample.second).toBe(2);
  });
});

describe('GIVEN a non dto used as a mixin', () => {
  it('THEN its attributes should be handled', () => {
    const Plain = class {
      constructor() {
        this.plain = 'p';
      }
    };

    const SampleDto = dto(class {
      own;
    }, Plain);

    expect(new SampleDto({ own: 'o' }).plain).toBe('p');
  });
});

describe('GIVEN `omit` applied on a dto', () => {
  // regression: `omit` extends a dto without being one, it still needs the proxy
  it('THEN the omitted attribute should be ignored', () => {
    const SampleDto = omit(dto(class {
      @number
      kept = '1';

      removed = 'x';
    }), ['removed']);

    const sample = new SampleDto();

    expect(sample.kept).toBe(1);
    expect(sample.removed).toBeUndefined();
    expect(JSON.parse(JSON.stringify(sample))).toEqual({ kept: 1 });
  });
});

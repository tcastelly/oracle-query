import { describe, expect, it } from '@jest/globals';
import { dto, number } from '../../../src/_base/dto';

@dto
class MixinDto {
  constructor(_attrs?: object) {
  }

  label: string;

  qty: number;

  flag: boolean;
}

// `@dto` used bare, the returned type has to stay assignable to the decorated class
@dto
class BareDto {
  own: string;
}

// `@dto({ mixins })`, the mixins can't be typed here (microsoft/TypeScript#4881)
@dto({
  mixins: [MixinDto],
})
class DecoratedDto {
  own: string;
}

// a decorator is not allowed in a class expression, the class has to be declared first
@dto
class MergedDto$ {
  own: string;

  // redeclares a field of the mixin with an other type
  @number
  flag: null | number;
}

@dto
class SecondMixinDto {
  constructor(_attrs?: object) {
  }

  second: string;
}

// `dto(cls, [mixins])`, the only form able to type the mixins
const MergedDto = dto(MergedDto$, [MixinDto]);

type MergedDto = InstanceType<typeof MergedDto>;

// the mixins are accepted spread too
const SpreadDto = dto(MergedDto$, MixinDto);

type SpreadDto = InstanceType<typeof SpreadDto>;

// several mixins
const MultiDto = dto(MergedDto$, [MixinDto, SecondMixinDto]);

type MultiDto = InstanceType<typeof MultiDto>;

describe('GIVEN the types of a dto', () => {
  it('THEN `dto(cls, ...mixins)` should expose the mixin fields', () => {
    const merged = new MergedDto({ label: 'l', qty: 1 });

    const label: string = merged.label;
    const qty: number = merged.qty;

    expect([label, qty]).toEqual(['l', 1]);
  });

  it('THEN a field of `cls` should win over the mixin one', () => {
    const merged = new MergedDto({ flag: 2 });

    // `flag` is `boolean` in the mixin, `null | number` here
    const flag: null | number = merged.flag;

    expect(flag).toBe(2);
  });

  it('THEN `keyof` should include the mixin keys', () => {
    const keys: (keyof MergedDto)[] = ['own', 'flag', 'label', 'qty'];

    expect(keys).toHaveLength(4);
  });

  it('THEN the decorator forms should keep their own fields', () => {
    const bare: string = new BareDto().own;
    const decorated: string = new DecoratedDto().own;

    expect([bare, decorated]).toEqual([undefined, undefined]);
  });

  it('THEN the spread form should be typed like the array one', () => {
    const spread = new SpreadDto({ label: 'l' });

    const label: string = spread.label;
    const flag: null | number = spread.flag;

    // `@number` without initializer defaults to null
    expect([label, flag]).toEqual(['l', null]);
  });

  it('THEN every mixin of the array should be exposed', () => {
    const multi = new MultiDto({ label: 'l', second: 's' });

    const label: string = multi.label;
    const second: string = multi.second;

    expect([label, second]).toEqual(['l', 's']);
  });
});

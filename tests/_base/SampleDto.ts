import {
  boolean,
  dto,
  hidden,
  nullable,
} from '@/_base/dto/index';
import type { Obj } from '@/types';

@dto
class ItemDto {
  constructor(obj?: Obj) {
  }

  id: number;

  lbl: string;
}

@dto
export class ParentDto {
  constructor(obj?: Obj) {
  }

  parentAttr: string;

  // this field will be overrided by SampleDto
  ok: number | boolean;
}

@dto
class SampleDtoWithExtends extends ParentDto {
  id = 0;

  @hidden
  password: string;

  @nullable(boolean)
  nullableBool: null | boolean;

  @boolean
  ok: boolean;

  @boolean
  ko: boolean;

  _items: ItemDto[] = [];

  set items(_items: (ItemDto | Obj)[]) {
    this._items = _items.map((item) => new ItemDto(item));
  }

  get items(): ItemDto[] {
    return this._items;
  }
}

@dto({
  mixins: [ParentDto],
})
class SampleDtoWithMixins {
  id = 0;

  @hidden
  password: string;

  @nullable(boolean)
  nullableBool: null | boolean;

  @boolean
  ok: boolean;

  @boolean
  ko: boolean;

  _items: ItemDto[] = [];

  set items(_items: (ItemDto | Obj)[]) {
    this._items = _items.map((item) => new ItemDto(item));
  }

  get items(): ItemDto[] {
    return this._items;
  }
}

export default SampleDtoWithExtends;

export {
  ItemDto,
  SampleDtoWithMixins,
};

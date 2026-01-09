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
}

interface SampleDto extends ParentDto {
}

@dto({
  mixins: [ParentDto],
})
class SampleDto {
  constructor(obj?: Obj) {
  }

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

export default SampleDto;

export {
  ItemDto,
};

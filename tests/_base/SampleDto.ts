import { boolean, dto, hidden } from '@/_base/dto/index';
import type { Obj } from '@/types';

@dto
class ItemDto {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(obj?: Obj) {
  }

  id: number;

  lbl: string;
}

@dto
export class ParentDto {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(obj?: Obj) {
  }

  id = 0;

  @hidden
    password: string;

  @boolean
    ok: boolean;

  @boolean
    ko: boolean;

  _items: Array<ItemDto> = [];

  set items(_items: Array<ItemDto | Obj>) {
    this._items = _items.map((item) => new ItemDto(item));
  }

  get items() {
    return this._items;
  }
}

export default SampleDto;

export {
  ItemDto,
};

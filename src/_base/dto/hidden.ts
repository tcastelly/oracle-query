import type { DescriptorType } from '@/definitions/decorator.d';
import type { Obj } from '@/types';

//
// an hidden attribute can't be listed, but can be access directly

export default function (target: Obj, key: string, descriptor?: DescriptorType): any {
  const privateKey = `?${key}`;

  Object.defineProperty(target, privateKey, {
    writable: true,
    // @ts-ignore - not a standard
    value: descriptor.initializer ? descriptor.initializer() : null,
  });

  return {
    set(value: unknown) {
      this[privateKey] = value;
    },
    get() {
      return this[privateKey];
    },
    enumerable: true,
    configurable: true,
  };
}

import type { DescriptorType } from '@/definitions/decorator.d';
import type { Obj } from '@/types';

export default function (target: Obj, key: string, descriptor?: DescriptorType): any {
  const privateKey = `_${key}`;

  Object.defineProperty(target, privateKey, {
    writable: true,
    // @ts-ignore - not standard
    value: descriptor.initializer ? Number(descriptor.initializer()) : null,
  });

  return {
    set(value: string | number) {
      // @ts-ignore
      this[privateKey] = +value;
    },
    get(): number {
      // @ts-ignore
      return this[privateKey] as number;
    },
    enumerable: true,
    configurable: true,
  };
}

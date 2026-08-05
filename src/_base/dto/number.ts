import type { DescriptorType } from '@/definitions/decorator.d';
import type { Obj } from '@/types';

export default function (target: Obj, key: string, descriptor?: DescriptorType): any {
  const privateKey = `_${key}`;

  // @ts-ignore - not standard
  const init = descriptor.initializer?.() ?? null;

  Object.defineProperty(target, privateKey, {
    writable: true,
    value: init !== null && init !== undefined ? Number(init) : init,
  });

  return {
    set(value: string | number) {
      this[privateKey] = value !== null && value !== undefined ? Number(value) : value;
    },
    get(): number {
      return this[privateKey];
    },
    enumerable: true,
    configurable: true,
  };
}

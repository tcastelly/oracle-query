import type { DescriptorType } from '@/definitions/decorator.d';

const isTrue = (value: undefined | string | number | boolean): undefined | boolean => {
  if (value === undefined) {
    return undefined;
  }

  const valStr = String(value).toUpperCase();

  return value === true || value === 1 || value === 'A' || valStr === String(true).toUpperCase();
};

/**
 * Transform a db boolean
 * int/string to boolean
 */

export default function<T> (target: T, key: keyof T, descriptor?: DescriptorType): any {
  const privateKey = `_${String(key)}`;

  if (descriptor) {
    Object.defineProperty(target, privateKey, {
      writable: true,
      // @ts-ignore - not standard
      value: descriptor.initializer ? isTrue(descriptor.initializer()) : undefined,
    });
  }

  return {
    set(value: string | number | boolean) {
      this[privateKey] = isTrue(value);
    },
    get() {
      return this[privateKey];
    },
    enumerable: true,
    configurable: true,
  };
}

import type { DescriptorType } from '@/definitions/decorator.d';

const isTrue = (value: string | number | boolean): boolean => {
  const valStr = String(value).toUpperCase();

  return value === true || value === 1 || value === 'A' || valStr === String(true).toUpperCase();
};

/**
 * Transform a db boolean
 * int/string to boolean
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function <T> (target: T, key: keyof T, descriptor?: DescriptorType): any {
  const privateKey = `_${String(key)}`;

  if (descriptor) {
    Object.defineProperty(target, privateKey, {
      writable: true,
      // @ts-ignore - not standard
      value: descriptor.initializer ? isTrue(descriptor.initializer()) : null,
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

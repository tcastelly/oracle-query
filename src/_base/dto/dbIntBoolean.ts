import type { DescriptorType } from '@/definitions/decorator.d';

const toInt = (value: null | string | number | boolean): null | 0 | 1 => {
  if (value === null) {
    return null;
  }

  return (value === true || value === 1 ? 1 : 0);
};

// Map a boolean to a number for db compatibility
export default function<T>(target: T, key: keyof T, descriptor?: DescriptorType): any {
  const privateKey = `_${String(key)}`;

  if (descriptor) {
    Object.defineProperty(target, privateKey, {
      writable: true,
      // @ts-ignore - not a standard
      value: descriptor.initializer ? toInt(descriptor.initializer()) : null,
    });
  }

  return {
    set(value: string | number | boolean) {
      // @ts-ignore
      this[privateKey] = toInt(value);
    },
    get(): number {
      // @ts-ignore
      return this[privateKey] as number;
    },
    enumerable: true,
    configurable: true,
  };
}

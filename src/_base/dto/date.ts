import type { DescriptorType } from '@/definitions/decorator.d';

export default function<T> (target: T, key: keyof T, descriptor?: DescriptorType): any {
  const privateKey = `_${String(key)}`;

  if (descriptor) {
    Object.defineProperty(target, privateKey, {
      writable: true,
      // @ts-ignore - not a standard
      value: descriptor.initializer ? new Date(descriptor.initializer()) : null,
    });
  }

  return {
    set(value: string | Date) {
      // @ts-ignore
      this[privateKey] = value ? new Date(value) : null;
    },
    get(): Date {
      // @ts-ignore
      return this[privateKey] as Date;
    },
    enumerable: true,
    configurable: true,
  };
}

import type { DescriptorType } from '@/definitions/decorator.d';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function <T> (target: T, key: keyof T, descriptor?: DescriptorType): any {
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
      this[privateKey] = value ? new Date(value) : null;
    },
    get() {
      return this[privateKey];
    },
    enumerable: true,
    configurable: true,
  };
}

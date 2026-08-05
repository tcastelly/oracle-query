import type { DescriptorType } from '@/definitions/decorator.d';

const toActive = (value: string | number | boolean): 'A' | 'I' => (value === true || value === 'A' ? 'A' : 'I');

/**
 * Cast a boolean to a 'A' | 'I' for db compatibility
 */

type ActiveInactive = 'A' | 'I';

export default function<T> (target: T, key: keyof T, descriptor?: DescriptorType): any {
  const privateKey = `_${String(key)}`;

  if (descriptor) {
    Object.defineProperty(target, privateKey, {
      writable: true,
      // @ts-ignore - not a standard
      value: descriptor.initializer ? toActive(descriptor.initializer()) : null,
    });
  }

  return {
    set(value: string | number | boolean) {
      // @ts-ignore
      this[privateKey] = toActive(value);
    },
    get(): ActiveInactive {
      // @ts-ignore
      return this[privateKey] as ActiveInactive;
    },
    enumerable: true,
    configurable: true,
  };
}

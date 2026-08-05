import type { DescriptorType } from '@/definitions/decorator.d';

const trueStr = String(true);

const falseStr = String(false);

const toStr = (value: string | boolean): typeof trueStr => (value === true || value === trueStr ? trueStr : falseStr).toUpperCase();

// Map a boolean to a number for db compatibility

export default function<T>(target: T, key: keyof T, descriptor?: DescriptorType): any {
  const privateKey = `_${String(key)}`;

  if (descriptor) {
    Object.defineProperty(target, privateKey, {
      writable: true,
      // @ts-ignore - not a standard
      value: descriptor.initializer ? toStr(descriptor.initializer()) : null,
    });
  }

  return {
    set(value: string | boolean) {
      this[privateKey] = toStr(value);
    },
    get(): string {
      // @ts-ignore
      return this[privateKey] as string;
    },
    enumerable: true,
    configurable: true,
  };
}

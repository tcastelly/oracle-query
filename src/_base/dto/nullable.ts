import type { DescriptorType } from '@/definitions/decorator.d';

/**
 * If the value is null return null
 * Else apply the decorator
 */
export default function<T> (decorator: ((target: T, key: keyof T, descriptor?: DescriptorType) => any)): any {
  return (target: T, key: keyof T, descriptor?: DescriptorType) => {
    // because `privateKey` start by `_` it will be hidden for Object.keys
    const privateKey = `_${String(key)}`;

    const r = decorator(target, key, descriptor);

    if (descriptor) {
      // @ts-ignore - not standard
      const initVal = descriptor?.initializer?.() ?? null;
      Object.defineProperty(target, privateKey, {
        writable: true,
        // @ts-ignore - not standard
        value: initVal,
      });
    }

    return {
      set(value: unknown) {
        const _this = (this as Record<string, unknown>);
        _this[privateKey] = value;
        r.set(value);
      },
      get() {
        const _this = (this as Record<string, unknown>);
        if (_this[privateKey] === null) {
          return null;
        }
        return r.get();
      },
      enumerable: true,
      configurable: true,
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    } as unknown as void;
  };
}

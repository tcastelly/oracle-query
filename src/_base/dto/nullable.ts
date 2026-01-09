import type { DescriptorType } from '@/definitions/decorator.d';

/**
 * If the value is null return null
 * Else return the decorator value
 */
export default function<T>(decorator: ((target: T, key: keyof T, descriptor?: DescriptorType) => any)): any {
  return (target: T, key: keyof T, descriptor?: DescriptorType) => {
    // because `privateKey` start by `_` it will be hidden for Object.keys
    const privateKey = `_${String(key)}`;

    const _target = {} as T;

    // @ts-ignore
    const decoratedAttr = decorator(_target, key, descriptor);

    Object.defineProperty(_target, key, decoratedAttr);

    // @ts-ignore - not standard
    const initVal = descriptor?.initializer ? descriptor.initializer() : null;

    Object.defineProperty(target, privateKey, {
      writable: true,
      value: initVal,
    });

    return {
      set(value: T[keyof T]) {
        const _this = (this as Record<string, unknown>);
        _target[key] = value;

        if (value === null) {
          _this[privateKey] = null;
        } else {
          _this[privateKey] = _target[key];
        }
      },
      get() {
        const _this = (this as Record<string, unknown>);

        return _this[privateKey];
      },
      enumerable: true,
      configurable: true,
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    } as unknown as void;
  };
}

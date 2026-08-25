export type Constructor<T = any> = new (...args: any[]) => T;

const omit = <C extends Constructor, K extends keyof InstanceType<C>>(
  cls: C,
  keys: K[],
): (new (...args: ConstructorParameters<C>) => Omit<InstanceType<C>, K>) & Omit<C, 'prototype'> => {
  class OmittedClass extends (cls as any) {
    constructor(...args: any[]) {
      super(...args);
      // eslint-disable-next-line no-restricted-syntax
      for (const attr of keys) {
        delete (this as any)[attr];
      }
    }
  }

  const proto = cls.prototype as Record<string, unknown>;
  proto._ignore = keys;

  return OmittedClass as unknown as (new (...args: ConstructorParameters<C>) => Omit<InstanceType<C>, K>) & Omit<C, 'prototype'>;
};

export default omit;

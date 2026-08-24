export type Constructor<T = any> = new (...args: any[]) => T;

export type OmitCls<C extends Constructor, K extends keyof InstanceType<C>> = (new (...args: ConstructorParameters<C>) => Omit<InstanceType<C>, K>)
  & Omit<C, 'prototype'>;

const omitCls = <C extends Constructor, K extends keyof InstanceType<C>>(
  cls: C,
  keys: K[],
): OmitCls<C, K> => {
  class OmittedClass extends (cls as any) {
    constructor(...args: any[]) {
      super(...args);
      // eslint-disable-next-line no-restricted-syntax
      for (const attr of keys) {
        delete (this as any)[attr];
      }
    }
  }

  // Safe mutation without using 'any' to please other unsafe ESLint rules
  const proto = cls.prototype as Record<string, unknown>;
  proto._ignore = keys;

  return OmittedClass as unknown as OmitCls<C, K>;
};

export default omitCls;

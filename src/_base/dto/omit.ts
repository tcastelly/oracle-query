export type IgnoredClass<C extends new (...args: any[]) => any, K extends keyof InstanceType<C>> = (
    new (...args: ConstructorParameters<C>) => Omit<InstanceType<C>, K>
    )
  & Omit<C, 'prototype'>;

export default function omit<
  C extends new (...args: any[]) => any,
  K extends keyof InstanceType<C>,
>(
  cls: C,
  keys: K[],
): IgnoredClass<C, K> {
  // Safe mutation without using 'any' to please other unsafe ESLint rules
  const proto = cls.prototype as Record<string, unknown>;
  proto._ignore = keys;

  return cls;
}

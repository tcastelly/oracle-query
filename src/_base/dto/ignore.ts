export default function omit<
  C extends new (...args: any[]) => any,
  K extends keyof InstanceType<C>,
>(
  cls: C,
  keys: K[],
): (new (...args: ConstructorParameters<C>) => Omit<InstanceType<C>, K>) & Omit<C, 'prototype'> {
  // Inside here, JavaScript handles the class mutation,
  // and we cast it to the advanced type above.

  cls.prototype._ignore = keys;

  return cls;
}

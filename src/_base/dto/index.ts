import boolean from './boolean';
import dbDate, { mapToDbDate } from './dbDate';
import nullable from './nullable';
import dto from './dto';
import hidden from './hidden';
import omit from './omit';
import dbIntBoolean from './dbIntBoolean';
import type { IgnoredClass as IgnoredClass$ } from './omit';

export type IgnoredClass<C extends new (...args: any[]) => any, K extends keyof InstanceType<C>> = IgnoredClass$<C, K>;

export {
  dto,
  dbDate,
  mapToDbDate,
  boolean,
  nullable,
  hidden,
  omit,
  dbIntBoolean,
};

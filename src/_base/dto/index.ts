import boolean from './boolean';
import dbDate, { mapToDbDate } from './dbDate';
import nullable from './nullable';
import dto from './dto';
import hidden from './hidden';
import number from './number';
import date from './date';
import omit from './omit';
import dbStrBoolean from './dbStrBoolean';
import dbIntBoolean from './dbIntBoolean';
import dbFlagBoolean from './dbFlagBoolean';
import type { IgnoredClass as IgnoredClass$ } from './omit';

export type IgnoredClass<C extends new (...args: any[]) => any, K extends keyof InstanceType<C>> = IgnoredClass$<C, K>;

export {
  dto,
  number,
  boolean,
  nullable,
  hidden,
  omit,
  mapToDbDate,
  date,
  dbStrBoolean,
  dbDate,
  dbIntBoolean,
  dbFlagBoolean,
};

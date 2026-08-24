import boolean from './boolean';
import dbDate, { mapToDbDate } from './dbDate';
import nullable from './nullable';
import dto from './dto';
import hidden from './hidden';
import number from './number';
import date from './date';
import type {
  OmitCls as $OmiCls,
  Constructor,
} from './omit';
import omit from './omit';
import dbStrBoolean from './dbStrBoolean';
import dbIntBoolean from './dbIntBoolean';
import dbFlagBoolean from './dbFlagBoolean';

export type OmitCls<T extends Constructor, Z extends keyof InstanceType<T>> = $OmiCls<T, Z>;

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

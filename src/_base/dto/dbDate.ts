import type { DescriptorType } from '@/definitions/decorator.d';

const mapToDbDate = (value: null | string) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  let date: Date | string = value;

  if (String(date).search(/^TO_DATE/) === 0) {
    return date;
  }

  if (date.length !== 'YYYY-MM-DD'.length) {
    date = new Date(date);

    const year = String(date.getFullYear());
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());

    if (month.length < 2) {
      month = `0${month}`;
    }
    if (day.length < 2) {
      day = `0${day}`;
    }
    date = `${year}-${month}-${day}`;
  }

  return `TO_DATE('${date}', 'YYYY-MM-DD')`;
};

// Cast a date to a plsql function for db compatibility

export default function <T> (target: T, key: keyof T, descriptor?: DescriptorType): any {
  const privateKey = `_${String(key)}`;

  if (descriptor) {
    Object.defineProperty(target, privateKey, {
      writable: true,
      // @ts-ignore - not a standard
      value: descriptor.initializer ? mapToDbDate(descriptor.initializer()) : undefined,
    });
  }

  return {
    set(value: string) {
      this[privateKey] = mapToDbDate(value);
    },
    get() {
      return this[privateKey];
    },
    enumerable: true,
    configurable: true,
  };
}

export {
  mapToDbDate,
};

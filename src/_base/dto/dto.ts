import type { Obj, Class, T } from '../../types';

/**
 * Dto Proxy
 *
 * It's not possible to extends Proxified dto because of decorators used (@dbDate, ...)
 * Each cls in mixins will create an other dto, in function of the set/get, the proxy return the good
 */

const decorator = (target: T, ...mixins: Array<Class>) => {
  const decoratedAttr = Object.getOwnPropertyNames(target.prototype);

  return class extends target {
    constructor(attrs: Obj = {}) {
      super(attrs);

      const targets = mixins.map((Cls) => {
        const dto = new Cls();
        const setables = dto._setables;

        return {
          dto,
          setables,
        };
      });

      const getTarget = (attrName: PropertyKey) => {
        const { length } = targets;
        let found = false;
        let i = 0;

        while (!found && i < length) {
          found = targets[0].setables.indexOf(attrName) > -1;
          i += 1;
        }

        return found ? targets[i - 1].dto : null;
      };

      const setables = [
        ...new Set([
          ...decoratedAttr,
          ...targets.reduce((acc, v) => ([...acc, ...v.setables]), []),
          ...Object.getOwnPropertyNames(this),
        ]
          .map((attr) => (attr.substring(0, 1) === '_' ? attr.substring(1) : attr))
          .filter((attr) => attr !== 'constructor'))];

      // remove hidden
      const ownKeys = () => setables.filter((key) => {
        const potentialHidden = `?${key}`;
        const isHidden = key.substring(0, 1) === '?' || setables.findIndex((k) => k === potentialHidden) > -1;
        if (isHidden) {
          return false;
        }

        const potentialPublicName = key.substring(1);

        const isPrivate = key.substring(0, 1) === '_';
        const isDecorated = isPrivate && setables.findIndex((k) => k === potentialPublicName) > -1;

        return !(isPrivate && !isDecorated);
      });

      const proxy = new Proxy(this, {
        set(_target, name, value) {
          if (setables.includes(name)) {
            (getTarget(name) || _target)[name] = value;
          }
          if (_target._set) {
            _target._set(name, value);
          }
          return true;
        },
        get(_target, name) {
          // rewrite JSON.stringify
          if (name === 'toJSON') {
            return () => ownKeys().reduce((acc, v) => {
              acc[v] = (getTarget(v) || _target)[v];
              return acc;
            }, {});
          }

          // default access to a variable
          return name === '_setables' ? setables : (getTarget(name) || _target)[name];
        },

        // Implements Object.keys
        ownKeys,
        // NodeJS fix to retrieve properly deep Dto
        ...(typeof window === 'undefined' ? {
          getOwnPropertyDescriptor() {
            return {
              enumerable: true,
              configurable: true,
            };
          },
        } : {}),
      });

      // proxy constructor, assign all attributes
      Object.keys(attrs).forEach((attr) => {
        proxy[attr] = attrs[attr];
      });

      // eslint-disable-next-line no-constructor-return
      return proxy;
    }
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (args: T | { mixins?: Array<Class> }, ...mixins: Array<Class>): any {
  // called by @dto({ mixins: [] })
  if (typeof args === 'object' && args.mixins) {
    return (target: T) => decorator(target, ...(args.mixins || []));
  }

  // called by @dto
  return decorator(args as T, ...mixins);
}

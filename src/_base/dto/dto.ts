import type { Class, Obj, T } from '../../types';

/**
 * Dto Proxy
 *
 * Each cls in mixins will create an other dto, in function of the set/get, the proxy return the good
 *
 * A `class Child extends Parent` is supported too, the parent is resolved like a mixin:
 * its decorated attributes are collected by walking the prototype chain, and the fields
 * redeclared in the child take precedence.
 */

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

type MixinsInstance<M extends Class[]> = UnionToIntersection<InstanceType<M[number]>>;

type Merged<C extends Class, M extends Class[]> = InstanceType<C> & Omit<MixinsInstance<M>, keyof InstanceType<C>>;

/**
 * Instance of `cls` augmented by every mixin.
 * An attribute declared in `cls` always wins over the same attribute of a mixin
 */
export type DtoCls<C extends Class, M extends Class[]> = (new (attrs?: Obj) => Merged<C, M>)
  & Omit<C, 'prototype'>
  & { prototype: Merged<C, M> };

/**
 * Flags a class built by `dto`. Used as an own (non inherited) static, so a class
 * extending a dto without being a dto itself (e.g. `omit`) is not detected as one
 */
const isDto = Symbol('isDto');

const isDtoCls = (cls: unknown) => Object.hasOwn(cls as object, isDto);

/**
 * All attributes owned by the prototype chain of `cls`, `Object.prototype` excluded.
 * Decorators (@number, @dbDate, ...) define accessors on the prototype, walking the chain
 * is the only way to get the ones declared by a parent class
 */
const protoAttrs = (cls: T) => {
  const attrs = new Set<string>();

  let proto = cls.prototype as object | null;
  while (proto && proto !== Object.prototype) {
    Object.getOwnPropertyNames(proto).forEach((attr) => attrs.add(attr));
    proto = Object.getPrototypeOf(proto) as object | null;
  }

  return [...attrs];
};

/**
 * A parent constructor declares its own fields with `Object.defineProperty(this, attr)`.
 * When a child redeclares the same attr with a decorator, the accessor is installed on the
 * prototype and ends up shadowed by that own value. Give the accessor back its priority,
 * and replay the value through it to keep an initializer of the parent
 */
const applyProtoAccessors = (instance: Obj) => {
  Object.getOwnPropertyNames(instance).forEach((attr) => {
    const own = Object.getOwnPropertyDescriptor(instance, attr);
    if (!own || own.get || own.set) {
      return;
    }

    let proto = Object.getPrototypeOf(instance) as object | null;
    while (proto && proto !== Object.prototype) {
      const inherited = Object.getOwnPropertyDescriptor(proto, attr);

      // the closest declaration of the chain wins
      if (inherited) {
        if (inherited.get || inherited.set) {
          delete instance[attr];

          if (own.value !== undefined) {
            instance[attr] = own.value;
          }
        }
        return;
      }

      proto = Object.getPrototypeOf(proto) as object | null;
    }
  });
};

const decorator = (target: T, ...mixins: Class[]) => {
  const decoratedAttr = protoAttrs(target);

  const Dto = class extends target {
    constructor(attrs: Obj = {}) {
      super(attrs);

      // a derived dto will build the proxy for the whole chain. Proxifying here too would
      // make the derived class lose its own non decorated fields: babel assigns them with
      // `this[attr] = undefined`, which the proxy `set` rejects as it's not a known setable
      if (new.target !== Dto && isDtoCls(new.target)) {
        // eslint-disable-next-line no-constructor-return
        return this;
      }

      applyProtoAccessors(this);

      // rewrite JSON.stringify
      // an already declared dto can force to ignore fields
      // e.g:
      // const AA = @dto class A { dt3: string }
      // AA._ignore = ['dt3'];
      let ignore: string[] = [];

      const targets = mixins
        .map((Cls) => {
          const dto = new Cls();

          // a mixin is not necessarily a dto, fallback on its own attributes
          const mixinSetables = (dto._setables ?? Object.getOwnPropertyNames(dto)) as PropertyKey[];

          // priorise decorator declared in target (not in parent)
          const setables = mixinSetables.filter((parrentK) => !decoratedAttr.find((k) => parrentK === k));

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
          found = targets[i].setables.includes(attrName);
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
          .map((attr: string) => (attr.startsWith('_') ? attr.substring(1) : attr))
          .filter((attr) => attr !== 'constructor'))];

      // remove hidden
      const ownKeys = () => setables.filter((key) => {
        const potentialHidden = `?${key}`;
        const isHidden = key.startsWith('?') || setables.findIndex((k) => k === potentialHidden) > -1;
        if (isHidden || (ignore || []).includes(key)) {
          return false;
        }

        const potentialPublicName = key.substring(1);

        const isPrivate = key.startsWith('_');
        const isDecorated = isPrivate && setables.findIndex((k) => k === potentialPublicName) > -1;

        return !(isPrivate && !isDecorated && (ignore || []).includes(key));
      });

      const proxy = new Proxy(this, {
        set(_target, name: string, value) {
          if (setables.includes(name)) {
            (getTarget(name) || _target)[name] = value;
          }
          if (_target._set) {
            _target._set(name, value);
          }
          return true;
        },
        get(_target, name) {
          if ((ignore || []).includes(name as string)) {
            return undefined;
          }

          if (name === 'toJSON') {
            const init: Record<string, unknown> = {};
            return () => ownKeys().reduce((acc, v) => {
              acc[v] = (getTarget(v) || _target)[v];
              return acc;
            }, init);
          }

          if (name === '_ignore') {
            return _target._ignore;
          }

          // default access to a variable
          return name === '_setables' ? setables : (getTarget(name) || _target)[name];
        },

        // Implements Object.keys
        ownKeys,
        getOwnPropertyDescriptor() {
          return {
            enumerable: true,
            configurable: true,
          };
        },
      });

      // proxy constructor, assign all attributes
      Object.keys(attrs).forEach((attr) => {
        proxy[attr] = attrs[attr];
      });

      ignore = proxy._ignore;

      // eslint-disable-next-line no-constructor-return
      return proxy;
    }
  };

  Object.defineProperty(Dto, isDto, { value: true });

  return Dto;
};

// called by @dto({ mixins: [] })
// a class decorator can't change the type of the class it decorates (microsoft/TypeScript#4881),
// so the mixins are only known at runtime here. Use `dto(cls, ...mixins)` to get them typed
export default function dto(args: { mixins?: Class[] }): <C extends Class>(cls: C) => C;

// called by @dto, or by dto(cls, ...mixins)
export default function dto<C extends Class, M extends Class[]>(cls: C, ...mixins: M): DtoCls<C, M>;

export default function dto(args: T | { mixins?: Class[] }, ...mixins: Class[]): any {
  // called by @dto({ mixins: [] })
  if (typeof args === 'object' && args.mixins) {
    return (target: T) => decorator(target, ...(args.mixins || []));
  }

  // called by @dto
  return decorator(args as T, ...mixins);
}

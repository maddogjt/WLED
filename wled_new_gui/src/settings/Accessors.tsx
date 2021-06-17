/* eslint-disable @typescript-eslint/ban-types */
import dotProp from 'dot-prop-immutable';
import { F, Object, S } from 'ts-toolbelt';

export type PathType<O extends object, P extends string> = Object.Path<O, S.Split<P, '.'>>;
export type Path<O extends object, P extends string> = F.AutoPath<O, P>;

function get<O extends object, P extends string>(
  object: O,
  path: F.AutoPath<O, P>,
  defaultValue?: PathType<O, P>
): PathType<O, P> {
  return dotProp.get(object, path, defaultValue);
}

function set<O extends object, P extends string>(
  object: O,
  path: F.AutoPath<O, P>,
  value: PathType<O, P> | ((v: PathType<O, P>) => PathType<O, P>)
): O {
  return dotProp.set(object, path, value);
}

function merge<O extends object, P extends string>(
  source: O,
  path: F.AutoPath<O, P>,
  value: Partial<PathType<O, P>>
): O {
  return dotProp.merge(source, path, value);
}

function del<O extends object, P extends string>(source: O, path: F.AutoPath<O, P>): O {
  return dotProp.delete<O, O>(source, path) as O;
}

export const typedDotProp = {
  get,
  set,
  merge,
  delete: del,
  raw: dotProp,
};


export function bindSetter<T extends object>(setter: (inner: (v: T)=>T)=>void) {
  return <P extends string>(
    path: Path<T, P>,
    value: PathType<T, P> | ((v: PathType<T, P>) => PathType<T, P>)
  ): void => {
    setter((s: T) => typedDotProp.set<T, P>(s, path, value));
  };
}

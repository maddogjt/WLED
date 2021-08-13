/* eslint-disable @typescript-eslint/ban-types */
import { Path, PathType, typedDotProp } from './Accessors';

export interface Prop<T> {
  value: T;
  set: (v: T) => void;
}

export function getPathProp<O extends object, P extends string>(
  obj: O,
  set: (v: (v2: O) => O) => void,
  param: Path<O, P>
): Prop<PathType<O, P>> {
  return {
    value: typedDotProp.get<O, P>(obj, param),
    set: (v: PathType<O, P>) => set(base => typedDotProp.set<O, P>(base, param, v)),
  };
}

export function getPathPropRaw<O extends object, T>(
  obj: O,
  set: (v: (v2: O) => O) => void,
  path: number | string | (string | number)[]
): Prop<T> {
  return {
    value: typedDotProp.raw.get<O, T>(obj, path),
    set: (v: T) => set(base => typedDotProp.raw.set<O, O>(base, path, v)),
  };
}

export function bindGetPathProp<T extends object>(val: T, set: (v: (val: T)=>T) => void) {
  return <P extends string>(param: Path<T, P>): Prop<PathType<T, P>> => {
    return getPathProp<T, P>(val, set, param);
  };
}


export function bindGetPathPropRaw<T extends object>(val: T, set: (v: (val: T) => T) => void) {
  return <R>(path: number | string | (string | number)[]): Prop<R> => {
    return getPathPropRaw<T, R>(val, set, path);
  };
}

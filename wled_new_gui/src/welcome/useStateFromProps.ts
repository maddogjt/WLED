import { StateUpdater, useCallback, useEffect, useState } from 'preact/hooks';

function isCallback<T>(value: T | ((prevState: T) => T)): value is (p: T) => T {
  return typeof value === 'function';
}

export function useStateFromProps<T>(props: T, updater?: (v: T) => void): [T, StateUpdater<T>] {
  const [state, setState] = useState<T>(props);
  useEffect(() => {
    setState(props);
  }, [props]);

  let setter: StateUpdater<T> = setState;
  if (updater) {
    setter = useCallback((value: T | ((prevState: T) => T)) => {
      if (isCallback(value)) {
        let nv: T | undefined;
        setState((prevState: T) => {
          return (nv = value(prevState));
        });
        if (nv) updater(nv);
      } else {
        setState(value);
        updater(value);
      }
    }, [updater]);
  }

  return [state, setter];
}

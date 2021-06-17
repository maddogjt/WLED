import { useMemo } from 'preact/hooks';
import { BoundAction, Action } from 'predux/store';
import { useStore } from './useStore';

type AST<A extends Action<unknown>> = A extends Action<infer S> ? S : never;
export function useAction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Action<any>
>(action: T): BoundAction<AST<T>, T> {
  const store = useStore<AST<T>>();

  return useMemo(() => {
    return store.action(action);
  }, [store, action]);
}

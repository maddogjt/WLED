import { ActionArgs, BoundAction, BoundResult, Listener, Action } from '.';
import { Store, DefaultRootState } from '../';

function isPromise(v: unknown | Promise<unknown>): v is Promise<unknown> {
  return (v as Promise<unknown>).then !== undefined;
}

function createStore<S extends DefaultRootState>(initialState: Partial<S> | S = {}): Store<S> {
  let state: S = initialState as S;
  let listeners: Listener<S>[] = [];

  function dispatchListeners(action?: Action<S>) {
    const cur = listeners;
    cur.forEach((f) => f(state, action));
  }

  function setState(update: Partial<S>, action?: Action<S>) {
    state = {
      ...state,
      ...update,
    };

    dispatchListeners(action);
  }

  return {
    setState,
    subscribe(f: Listener<S>) {
      listeners.push(f);
      return () => {
        // make a new copy of array listener removed
        listeners = listeners.filter((e) => f === e);
      };
    },
    getState(): S {
      return state;
    },
    action<T extends Action<S>>(
      action: T
    ): BoundAction<S, T> {
      function apply(result: Partial<S>): void {
        setState(result, action);
      }

      const gs = () => this.getState();

      function processAction(
        this: Store<S>,
        ...args: ActionArgs<T, S>
      ): BoundResult<ReturnType<T>> {
        const ret = action.call(this, gs(), ...args);
        if (ret) {
          if (isPromise(ret)) return ret.then(apply) as BoundResult<ReturnType<T>>;
          return apply(ret) as BoundResult<ReturnType<T>>;
        }
        return undefined as BoundResult<ReturnType<T>>;
      }

      return processAction;
    },
  };
}
export { createStore };

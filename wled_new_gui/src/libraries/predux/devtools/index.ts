import { Store } from '../store';

declare module '../store' {
  interface Store<S> {
    devtools?: Devtools<S>;
  }
}

interface Devtools<S> {
  subscribe: (
    f: (message: { type: string; state: string; payload: { type: string } }) => void
  ) => void;
  init: (state: S) => void;
  send: (name: string, state: any) => void;
}

interface ReduxDevtoolExtension {
  connect: <S>() => Devtools<S>;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevtoolExtension;
  }
}

export function preduxDevTools<K>(store: Store<K>): Store<K> {
  const extension = window.__REDUX_DEVTOOLS_EXTENSION__ || window.top.__REDUX_DEVTOOLS_EXTENSION__;
  let ignoreState = false;

  if (!extension) {
    console.warn('Please install/enable Redux devtools extension');
    store.devtools = undefined;

    return store;
  }

  if (!store.devtools) {
    store.devtools = extension.connect<K>();
    store.devtools.subscribe(
      (message: { type: string; state: string; payload: { type: string } }) => {
        if (message.type === 'DISPATCH' && message.state) {
          ignoreState =
            message.payload.type === 'JUMP_TO_ACTION' || message.payload.type === 'JUMP_TO_STATE';
          store.setState(JSON.parse(message.state) /*, true*/);
        }
      }
    );
    store.devtools.init(store.getState());
    store.subscribe(function (state, action) {
      const actionName = (action && action.name) || 'setState';
      // const actionName = 'setState';

      if (!ignoreState) {
        store.devtools?.send(actionName, state);
      } else {
        ignoreState = false;
      }
    });
  }

  // const originalAction = store.action;
  // store.action = <T extends Action<K>>(action: T): BoundAction<K, T> => {

  //   const wrapAction = (s: K, ...args: unknown[]) => {
  //     console.log(`calling ${action.name}`);
  //     console.log('args', args);
  //     return action(s, ...args);
  //   }

  //   return originalAction(wrapAction as T);
  // };

  return store;
}

import { RootState, store } from './store';
import { updateRootState } from './wledState';

const remoteRoot = localStorage.getItem('remoteOverride') ?? '192.168.0.211';

type ConnectionState = 'valid' | 'warning' | 'error';
export const initialConnectionState: {
  connectionState: ConnectionState;
  server: string;
} = { connectionState: 'warning', server: remoteRoot };


export async function getJson<T = unknown>(path: string): Promise<T> {
  const url = `http://${remoteRoot}${path}`;
  const fetchRes = await window.fetch(url, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  });

  if (!fetchRes.ok) {
    store.action(updateConnectionState)('error');
    // showErrorToast();
  }
  const jsonRes = await fetchRes.json();

  store.action(updateConnectionState)('valid');
  return jsonRes as T;
}

export type Command<T> = T & {
  v: boolean;
  time: number;
};

export async function sendCommand<TCommand, R = unknown>(cmdIn: TCommand, verbose = true, rinfo = true): Promise<R> {
  const url = `http://${remoteRoot}${rinfo ? '/json/si' : '/json/state'}`;

  const command: Command<TCommand> = {
    v: verbose,
    time: Math.floor(Date.now() / 1000),
    ...cmdIn,
  };

  const fetchRes = await window.fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(command),
  });

  const ucs = (v: ConnectionState) => {
    if (store.getState().connection.connectionState !== v) {
      store.action(updateConnectionState)(v);
    }
  };

  if (!fetchRes.ok) {
    ucs('error');
    // showErrorToast();
  }
  const jsonRes = await fetchRes.json();
  console.log('json', jsonRes);

  store.action(updateRootState)(jsonRes);

  ucs('valid');
  return jsonRes;
}

// const urs: Action<RootState, [newSettings: Partial<typeof initialSettings>]> = updateSettings;
// const actions:ActionsObject<RootState> = {
//       updateSettings: urs
//     };

// export function initSettings() {
//   window
//     .fetch(remoteRoot + "/json/settings", {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })
//     .then((res) => res.json())
//     .then((res) => {
//       console.log("handling action");
//       console.log(res);
//       const boundUpdate = bindAction3(store, updateSettings);
//       const newSettings: Partial<typeof initialSettings> = { ...res };
//       boundUpdate(newSettings);
//     });
// }

// export function saveUiSettings(state: RootState) {
//   localStorage.setItem("wledUiCfg", JSON.stringify(state.uiSettings));
//   return state;
// }

export function updateConnectionState(
  state: RootState,
  newState: ConnectionState
): Partial<RootState> {
  if (newState === state.connection.connectionState) {
    return {};
  }
  return { connection: { ...state.connection, connectionState: newState } };
}

export function selectConnectionState(state: RootState): ConnectionState {
  return state.connection.connectionState;
}

export function selectServer(state: RootState): string {
  return state.connection.server;
}

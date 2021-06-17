import { createStore, DefaultRootState, Store } from 'predux';
import { preduxDevTools } from 'predux/devtools';
import { initialConnectionState } from './connection';
import { localSettingsSlice } from './localSettings';
import { initialPalettePreviews, initPalettePreviews } from './palettePreview';
import { initialPresets, initPresets } from './presets';
import { initialWledState, initRawState, initWledState } from './wledState';
import { initSettings, settingsSlice } from './settings';

type TInitialState = typeof initialState;
declare module 'predux' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultRootState extends TInitialState {}
}

const initialState = {
  localSettings: localSettingsSlice.initialState,
  state: initialWledState,
  palettePreviews: initialPalettePreviews,
  presets: initialPresets,
  connection: initialConnectionState,
  settings: settingsSlice.initialState,
  ...initRawState,
};

export type RootState = DefaultRootState;

const tempStore = createStore(initialState);
export const store: Store =
  process.env.NODE_ENV === 'development' ? preduxDevTools(tempStore) : tempStore;

initSettings(store);
initWledState(store);
initPalettePreviews(store);
initPresets(store);

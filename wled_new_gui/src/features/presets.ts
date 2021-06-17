import { Store } from 'predux/store';
import { getJson, sendCommand } from './connection';
import { RootState, store } from './store';

const kPresetStorageKey = 'wlP';

export type TPreset = {
  n: string;
  on: boolean;
  ql?: string;
  bri: number;
  transition: number;
  mainseg: number;
  seg: unknown[];
  win?: string;
};

export interface PresetData {
  // modifiedTime: number;
  [key: string]: TPreset;
}

export type TPresetUpdate = Partial<TPreset> & {
  o?: boolean;
  ib?: boolean;
  sb?: boolean;
  psave: number;
  n: string;
};

export const initialPresets: PresetData = {};

async function getPresetData(): Promise<PresetData> {
  const jsonRes = await getJson('/presets.json');

  const newData = jsonRes as PresetData;

  return newData;

  // .catch(function (error) {
  //   showToast(error, true);
  //   console.log(error);
  //   presetError(false);
  // });
}

const versionIII = 2;

export function initPresets(store: Store<RootState>): void {
  const presetDataJson = localStorage.getItem(kPresetStorageKey);
  if (presetDataJson) {
    try {
      const parsed = JSON.parse(presetDataJson) as {
        p: PresetData;
        version: number;
      };
      if (parsed && parsed.version === versionIII && parsed.p) {
        store.action(updatePresets)(parsed.p);
        return;
      }
    } catch (e) {}
  }

  loadPresets(store);
}

function loadPresets(store: Store): void {
  void getPresetData().then((presetData) => {
    store.action(updatePresets)(presetData);
    localStorage.setItem(kPresetStorageKey, JSON.stringify({ p: presetData, version: versionIII }));
  });
}

export function updatePresets(_state: RootState, presetData: PresetData): Partial<RootState> {
  return { presets: presetData };
}

export function selectPresets(state: RootState): PresetData {
  return state.presets;
}

export function updatePreset(presetUpdate: TPresetUpdate): void {
  void sendCommand(presetUpdate).then(() => loadPresets(store));
}

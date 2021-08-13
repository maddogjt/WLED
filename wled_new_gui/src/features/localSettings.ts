import { accessorFromState, createSlice } from './createSlice';
import { RootState } from './store';

export interface ThemeSettings {
  base: string;
  bg: {
    url: string;
  };
  alpha: {
    bg: number;
    tab: number;
  };
  color: {
    bg: string;
  };
}

export interface UISettings {
  colors: {
    picker: boolean;
    rgb: boolean;
    quick: boolean;
    hex: boolean;
  };
  labels: boolean;
  pcmbot: boolean;
  pid: boolean;
  seglen: boolean;
  css: boolean;
  hdays: boolean;
}

export interface LocalSettings {
  theme: ThemeSettings;
  ui: UISettings;
}

export const defaultSettings: LocalSettings = {
  theme: {
    base: 'dark',
    bg: { url: '' },
    alpha: { bg: 0.6, tab: 0.8 },
    color: { bg: '' },
  },
  ui: {
    colors: { picker: true, rgb: false, quick: true, hex: false },
    labels: true,
    pcmbot: false,
    pid: true,
    seglen: false,
    css: false,
    hdays: false,
  },
};

export const initialLocalSettings = GetLocalStorage();

function GetLocalStorage(): LocalSettings {
  let settings = { ...defaultSettings };
  const settingsStr = localStorage.getItem('wledUiCfg');
  if (settingsStr) {
    try {
      settings = { ...settings, ...JSON.parse(settingsStr) };
    } catch (e) {
      // throw "&#9888; Settings JSON parsing failed. (" + e + ")";
    }
  }
  return settings;
}

function makeUpdate(state: LocalSettings, settings: Partial<LocalSettings>): LocalSettings {
  const newState = { ...state, ...settings };
  localStorage.setItem('wledUiCfg', JSON.stringify(newState));
  return newState;
}

export const localSettingsSlice = createSlice({
  name: 'localsettings',
  initialState: initialLocalSettings,
  actions: {
    updateUiSettings: (
      state: LocalSettings,
      settings: Partial<UISettings>
    ): Partial<LocalSettings> => {
      return makeUpdate(state, { ui: { ...state.ui, ...settings } });
    },
    updateThemeSettings: (
      state: LocalSettings,
      settings: Partial<ThemeSettings>
    ): Partial<LocalSettings> => {
      return makeUpdate(state, { theme: { ...state.theme, ...settings } });
    },
    updateLocalSettings: (
      state: LocalSettings,
      settings: Partial<LocalSettings>
    ): LocalSettings => {
      return makeUpdate(state, settings);
    },
  },
});

export const { updateUiSettings, updateLocalSettings, updateThemeSettings } =
  localSettingsSlice.actions<RootState>(
    accessorFromState<RootState, 'localSettings'>('localSettings')
  );

export function selectLocalSettings(state: RootState): LocalSettings {
  return state.localSettings;
}

export function selectThemeSettings(state: RootState): ThemeSettings {
  return selectLocalSettings(state).theme;
}

export function selectUiSettings(state: RootState): UISettings {
  return selectLocalSettings(state).ui;
}

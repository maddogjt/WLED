import { Store } from 'predux/store';
import { getJson } from './connection';
import { accessorFromState, createSlice } from './createSlice';
import { RootState } from './store';

export interface Settings {
  rev: number[];
  vid: number;
  id: {
    mdns: string; //'wled-dev1';
    name: string; //'WLED';
    inv: string; //'Light';
  };
  nw: {
    ins: {
      ssid: string; //'JTWLAN';
      pskl: number; //9;
      psk?: string;
      ip: number[]; //[0, 0, 0, 0];
      gw: number[]; //[0, 0, 0, 0];
      sn: number[]; //[255, 255, 255, 0];
    }[];
  };
  ap: {
    ssid: string; //'WLED-AP';
    pskl: number; //8;
    psk?: string;
    chan: number; //1;
    hide: number; //0;
    behav: number; //0;
    ip: number[]; //[4, 3, 2, 1];
  };
  wifi: {
    sleep: boolean; //false;
    phy: number; //1;
  };
  eth?: {
    type: number;
  };
  hw: {
    led: {
      total: number; //30;
      maxpwr: number; //850;
      ledma: number; //55;
      rgbwm: number; //3;
      ins: {
        start: number; //0;
        len: number; //30;
        pin: number[]; //[16];
        order: number; //0;
        rev: boolean; //false;
        skip: number; //0;
        type: number; //22;
      }[];
    };
    btn: {
      max: number; //4;
      ins: {
        type: number; //0;
        pin: number[]; //[-1];
        macros: number[]; //[0, 0, 0];
      }[];
      tt: number; //32;
      mqtt: boolean;
    };
    ir: {
      pin: number; //4;
      type: number; //0;
    };
    relay: {
      pin: number; //12;
      rev: boolean; //false;
    };
  };
  light: {
    'scale-bri': number; //100;
    'pal-mode': number; //0;
    gc: {
      bri: number; //1;
      col: number; //2.8;
    };
    tr: {
      mode: boolean; // true
      dur: number; //7;
      pal: number; //0;
    };
    nl: {
      mode: number; //1;
      dur: number; //60;
      tbri: number; //0;
      macro: number; //0;
    };
  };
  def: {
    ps: number; //0;
    on: boolean; // true
    bri: number; //128;
  };
  if: {
    sync: {
      port0: number; //21324;
      port1: number; //65506;
      recv: {
        bri: boolean; // true
        col: boolean; // true
        fx: boolean; // true
      };
      send: {
        dir: boolean; // false
        btn: boolean; // false
        va: boolean; // false
        hue: boolean; // true
        macro: boolean; // false
        twice: boolean; // false
      };
    };
    nodes: {
      list: boolean; // true
      bcast: boolean; // true
    };
    live: {
      en: boolean; // true
      port: number; //5568;
      mc: boolean; // false
      dmx: {
        uni: number; //1;
        seqskip: boolean; // false
        addr: number; //1;
        mode: number; //4;
      };
      timeout: number; //25;
      maxbri: boolean; // false
      'no-gc': boolean; // true
      offset: number; //0;
    };
    va: {
      alexa: boolean; // false
      macros: number[]; //[0, 0];
    };
    blynk: {
      token: string; //'';
      host: string; //'blynk-cloud.com';
      port: number; //80;
    };
    mqtt: {
      en: boolean; // false
      broker: string; //'';
      port: number; //1883;
      user: string; //'';
      pskl: number; //0;
      psk?: string;
      cid: string; //'WLED-348e5c';
      topics: {
        device: string; //'wled/348e5c';
        group: string; //'wled/all';
      };
    };
    hue: {
      en: boolean; // false
      id: number; //1;
      iv: number; //25;
      recv: {
        on: boolean; // true
        bri: boolean; // true
        col: boolean; // true
      };
      ip: number[]; //[0, 0, 0, 0];
    };
    ntp: {
      en: boolean; // false
      host: string; //'0.wled.pool.ntp.org';
      tz: number; //0;
      offset: number; //0;
      ampm: boolean; // false
      ln: number; //0;
      lt: number; //0;
    };
  };
  ol: {
    clock: number; //0;
    cntdwn: boolean; // false
    min: number; //0;
    max: number; //29;
    o12pix: number; //0;
    o5m: boolean; // false
    osec: boolean; // false
  };
  timers: {
    cntdwn: {
      goal: number[]; //[20, 1, 1, 0, 0, 0];
      macro: number; //0;
    };
    ins: { en: number; hour: number; min: number; macro: number; dow: number }[];
  };
  ota: {
    lock: boolean; // false
    'lock-wifi': boolean; // false
    pskl: number; //7;
    psk?: string;
    aota: boolean; // true
  };
  um: {[key: string]: Record<string, unknown>};
  loaded: boolean;
}

export const settingsSlice = createSlice({
  initialState: { loaded: false } as Settings,
  name: 'settings',
  actions: {
    updateSettings: (state: Settings, settings: Partial<Settings>): Partial<Settings> => ({
      ...state,
      ...settings,
    }),
  },
});

export const { updateSettings } = settingsSlice.actions(
  accessorFromState<RootState, 'settings'>('settings')
);

export function initSettings(store: Store): void {
  getJson<Settings>('/json/cfg')
    .then((res) => {
      const newSettings: Partial<Settings> = { ...res, loaded: true };
      store.action(updateSettings)(newSettings);
    })
    .catch(() => {
      return;
    });
}

export const selectSettingsLoaded = (state: RootState): boolean => state.settings.loaded;

export const selectSettings = (state: RootState): Settings => {
  if (!state.settings.loaded) {
    throw 'Accessing settings before loaded';
  }
  return state.settings;
};

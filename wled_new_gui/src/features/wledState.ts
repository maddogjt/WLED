import { Store } from 'predux/store';
import { getJson } from './connection';
import { RootState } from './store';

export type TInfo = {
  freeheap: number;
  leds: { pwr: number; fps: string | number; wv: number; maxseg: number; count: number };
  u:
    | { [s: string]: string | number | [string | number, string] }
    | ArrayLike<string | number | [string | number, string]>;
  vid: string | number;
  wifi: { signal: string; rssi: string };
  uptime: string;
  mac: string | number;
  fs: { u: number; t: number };
  arch: string;
  core: string;
  lwip: string;
  ndc: number;
  name: string;
  ver: string;
  str: boolean;
  cn?: string;
  ip: string;
};

export const initRawState = {
  info: null as TInfo | null,
  effects: [] as string[],
  palettes: [] as string[],
};

export interface SegDef {
  id: number;
  start: number;
  stop: number;
  len: number;
  grp: number;
  spc: number;
  on: boolean;
  bri: number;
  col: SColor[];
  fx: number;
  sx: number;
  ix: number;
  pal: number;
  sel: boolean;
  rev: boolean;
  mi: boolean;
}

export const initialWledState = {
  on: false,
  bri: 0,
  transition: 3,
  ps: -1,
  pl: -1,
  ccnf: {
    min: 1,
    max: 5,
    time: 12,
  },
  nl: {
    on: false,
    dur: 60,
    fade: true,
    mode: 1,
    tbri: 0,
    rem: -1,
  },
  udpn: {
    send: false,
    recv: true,
  },
  lor: 0,
  mainseg: 0,
  seg: [] as SegDef[],
};

export type State = typeof initialWledState;
type SColor = number[];

let boundUpdateRootState: (s: Partial<RootState>) => void;

export function initWledState(store: Store<RootState>): void {
  void getJson<Partial<RootState>>('/json').then((json) => {
    boundUpdateRootState = store.action(updateRootState);
    const { settings, ...rest } = json;
    boundUpdateRootState(rest);
  });
}

export function refreshInfo(): void {
  void getJson<TInfo>('/json/info').then((json) => {
    const newState = { info: { ...json } };
    boundUpdateRootState(newState);
  });
}

export function updateRootState(
  state: RootState,
  newState: Partial<RootState>
): Partial<RootState> {
  return { ...state, ...newState };
}

export function selectEffects(state: RootState): string[] {
  return state.effects;
}

export function selectLoading(state: RootState): boolean {
  return state.info === null || state.state === null;
}

export function selectInfoLoaded(state: RootState): boolean {
  return state.info !== null;
}

export function selectInfo(state: RootState): TInfo {
  if (state.info === null) {
    throw "Info is not yet loaded";
  }
  return state.info;
}

export function selectPalettes(state: RootState): string[] {
  return state.palettes;
}

export function selectState(state: RootState): State {
  return state.state;
}

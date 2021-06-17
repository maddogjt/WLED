import { Store } from 'predux/store';
import { getJson } from './connection';
import { RootState } from './store';

const kPalStorageKey = 'wlPalx';

export type PalettePreview = (number[] | string)[];

export const initialPalettePreviews: PalettePreview[] = [];

async function getPalettesData(page: number): Promise<PalettePreview[]> {
  const previewData: PalettePreview[] = [];
  let pageCount = 1;

  do {
    const url = `/json/palx?page=${page}`;
    const jsonRes = await getJson<{ p: Record<number, PalettePreview>; m: number }>(url);

    for (const k in jsonRes.p) {
      previewData[k] = jsonRes.p[k];
    }
    pageCount = jsonRes.m;

    page++;
  } while (page <= pageCount);

  return previewData;
}

const versionIII = 3;

export function initPalettePreviews(store: Store<RootState>): void {

  // First attempt to load palettes from cache
  const palettesDataJson = localStorage.getItem(kPalStorageKey);
  if (palettesDataJson) {
    try {
      const parsed = JSON.parse(palettesDataJson) as {
        p: PalettePreview[];
        version: number;
      };

      // Check if the version has changed
      if (parsed && parsed.version === versionIII) {
        store.action(updatePalettePreviews)(parsed.p);
        return;
      }
    } catch (e) {}
  }

  // Perform load from network
  void getPalettesData(0).then((paletteData) => {
    store.action(updatePalettePreviews)(paletteData);

    // store the new palette data
    localStorage.setItem(kPalStorageKey, JSON.stringify({ p: paletteData, version: versionIII }));
  });
}

export function updatePalettePreviews(
  _state: RootState,
  palettePreviews: PalettePreview[]
): Partial<RootState> {
  return { palettePreviews };
}

export function selectPalettePreviews(state: RootState): PalettePreview[] {
  return state.palettePreviews;
}

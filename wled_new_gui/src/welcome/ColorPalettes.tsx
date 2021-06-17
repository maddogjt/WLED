import { RgbColor } from 'color-picker';
import { JSX } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { useSelector } from 'predux/preact';
import { PalettePreview, selectPalettePreviews } from '../features/palettePreview';
import { selectPalettes } from '../features/wledState';
import { useStateFromProps } from './useStateFromProps';

function genPalPrevCss(paletteData: PalettePreview, colors: RgbColor[]) {
  if (!paletteData) {
    return 'display: none';
  }

  // We need at least two colors for a gradient
  if (paletteData.length == 1) {
    const temp = [...paletteData];
    temp[1] = paletteData[0];
    if (Array.isArray(temp[1])) {
      temp[1][0] = 255;
    }
    paletteData = temp;
  }

  const gradient = [];
  for (let j = 0; j < paletteData.length; j++) {
    const element = paletteData[j];
    let rgb: RgbColor = { r: 0, g: 0, b: 0 };
    let index: number | undefined = undefined;
    if (Array.isArray(element)) {
      index = (element[0] / 255) * 100;
      rgb = { r: element[1], g: element[2], b: element[3] };
    } else if (element == 'r') {
      rgb = {
        r: Math.random() * 255,
        g: Math.random() * 255,
        b: Math.random() * 255,
      };
    } else {
      if (colors) {
        const pos = element.charCodeAt(1) - 48 - 1;
        rgb = colors[pos];
      }
    }
    if (index === undefined) {
      index = (j / paletteData.length) * 100;
    }

    gradient.push(`rgb(${rgb.r},${rgb.g},${rgb.b}) ${index}%`);
  }

  return `background: linear-gradient(to right,${gradient.join()});`;
}

export const ColorPalettes = (props: {
  colors: RgbColor[];
  selected: number;
  setSelected: (p: number) => void;
}): JSX.Element => {
  const palettes = useSelector(selectPalettes);
  const previews = useSelector(selectPalettePreviews);

  const [selected, setSelected] = useStateFromProps(props.selected, props.setSelected);

  const { colors } = props;
  const [searchTerm, setSearchTerm] = useState('');

  // Sort palettes, esplicitly inserting Default at the front
  const sorted = useMemo(() => {
    return [
      { id: 0, name: 'Default' },
      ...palettes
        .slice(1)
        .map((name, i) => ({ id: i + 1, name }))
        .sort((a, b) => (a.name < b.name ? -1 : 1)),
    ];
  }, [palettes]);

  // generate & memoize styles based on the palette previews, these will update when colors change
  const palPreviewStyles = useMemo(() => {
    return previews.map((val) => genPalPrevCss(val, colors));
  }, [previews, colors]);

  return (
    <>
      <p class="m-0 p-0">
        <i class="icons color-d">&#xe2b3;</i>
        Color palette
      </p>
      <div class="d-grid gap-3 sticky-list">
        <div class="position-relative mx-4">
          <input
            type="text"
            class="search form-control rounded-pill"
            placeholder="Search"
            value={searchTerm}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
          />
          <i class="icons" onClick={() => setSearchTerm('')}>
            &#xe38f;
          </i>
        </div>
        {sorted
          .filter((e) => e.name.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1)
          .map((p) => (
            <div
              key={p.id}
              data-selected={selected === p.id}
              data-sticky={p.id === 0}
              class="lstI btn mx-4"
              onClick={() => setSelected(p.id)}
            >
              {selected === p.id && (
                <div class="seldot">
                  <div class="bg-c-f sz-12 rounded-circle" />
                </div>
              )}
              <span class="text-nowrap">{p.name}</span>
              <div class="palprev" style={palPreviewStyles[p.id]} />
            </div>
          ))}
      </div>
    </>
  );
};

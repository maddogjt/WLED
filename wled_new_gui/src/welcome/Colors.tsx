import { HsvColor, RgbColor, RgbColorPicker } from 'color-picker';
import { hsvToRgb, rgbToRgbString } from 'color-picker/utils/convert';
import { hexToRgb, rgbToHex } from 'color-picker/utils/hexconvert';
import { JSX } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useAction, useSelector, useSelector2 } from 'predux/preact';
import { sendCommand } from '../features/connection';
import { selectUiSettings, UISettings, updateUiSettings } from '../features/localSettings';
import { selectInfo, selectState } from '../features/wledState';
import { ColorPalettes } from './ColorPalettes';
import { cssAddIf } from './cssUtils';
import { Dropdown } from './Dropdown';
import { Slider } from './Slider';
import { useStateFromProps } from './useStateFromProps';

const fixedColors: [string, RgbColor][] = [
  ['Red', { r: 255, g: 0, b: 0 }],
  ['Orange', { r: 255, g: 160, b: 0 }],
  ['Yellow', { r: 255, g: 200, b: 0 }],
  ['Warm White', { r: 255, g: 224, b: 160 }],
  ['White', { r: 255, g: 255, b: 255 }],
  ['Black', { r: 0, g: 0, b: 0 }],
  ['Pink', { r: 255, g: 0, b: 255 }],
  ['Blue', { r: 0, g: 0, b: 255 }],
  ['Cyan', { r: 255, g: 255, b: 200 }],
  ['Green', { r: 8, g: 255, b: 0 }],
];

const kBlack: RgbColor = { r: 0, g: 0, b: 0 };

let lastH = 0;
function randColor(): HsvColor {
  const col: HsvColor = { h: 0, s: 0, v: 100 };
  col.s = Math.floor(Math.random() * 50 + 50);
  do {
    col.h = Math.floor(Math.random() * 360);
  } while (Math.abs(col.h - lastH) < 50);
  lastH = col.h;

  return col;
}

type CType = UISettings['colors'];

const SettingItem = (props: {
  settings: CType;
  name: keyof CType;
  desc: string;
  onSet: (e: JSX.TargetedEvent<HTMLInputElement>, name: string) => void;
}) => {
  return (
    <div class="form-check">
      <input
        type="checkbox"
        class="form-check-input"
        checked={props.settings[props.name]}
        onChange={(e) => props.onSet(e, props.name)}
      />
      <label class="form-check-label" for="dropdownCheck">
        {props.desc}
      </label>
    </div>
  );
};

const RgbSlider = (props: {
  value: RgbColor;
  channel: keyof RgbColor;
  color: string;
  onSet: (c: Partial<RgbColor>) => void;
}): JSX.Element => {
  return (
    <Slider
      class="my-2"
      value={props.value[props.channel]}
      color={props.color}
      onChange={(e) => props.onSet({ [props.channel]: e.currentTarget.valueAsNumber })}
    />
  );
};

const HexEntry = (props: {
  curColor: RgbColor;
  updateColor: (c: RgbColor) => void;
}): JSX.Element => {
  const hexColor = rgbToHex(props.curColor).substr(1);
  const [value, setValue] = useStateFromProps(hexColor);

  function fromHex() {
    try {
      props.updateColor(hexToRgb(value));
    } catch (e) {
      props.updateColor(props.curColor);
    }
  }
  return (
    <div class="d-flex justify-content-center">
      <input
        type="text"
        class="form-control rounded-pill mx-2 w-50 text-center"
        value={value}
        onKeyDown={(e) => {
          if (e.keyCode === 13) {
            fromHex();
          }
        }}
        onInput={(e) => setValue(e.currentTarget.value)}
        autocomplete="off"
        maxLength={8}
      />
      <button class="btn sz-48 mx-2" onClick={fromHex} disabled={value === hexColor}>
        <i class="icons m-0">&#xe390;</i>
      </button>
    </div>
  );
};

const setPalette = (paletteId: number) => {
  const obj = { seg: { pal: paletteId } };
  void sendCommand(obj, true, false);
};

export const Colors = (): JSX.Element => {
  const info = useSelector(selectInfo);
  const cSettings = useSelector2(selectUiSettings, (s) => s.colors);
  const uUiSettings = useAction(updateUiSettings);
  const transition = useSelector2(selectState, (s) => s.transition);

  const [selectedColor, setSelectedColor] = useState(0);

  // Extract colors from segments list
  const segments = useSelector2(selectState, (s) => s.seg);
  const segment = useMemo(() => segments.find((s) => s.sel) ?? segments[0], [segments]);
  const colors: RgbColor[] = useMemo(() => {
    if (!segment) {
      return [kBlack, kBlack, kBlack];
    }
    const toColor = (c: number[]): RgbColor => {
      return { r: c[0], g: c[1], b: c[2] };
    };
    return segment.col.map(toColor);
  }, [segment]);

  const setCheck = (e: JSX.TargetedEvent<HTMLInputElement>, name: string) => {
    uUiSettings({ colors: { ...cSettings, [name]: e.currentTarget.checked } });
  };

  const updateColor = useCallback(
    (c: RgbColor | ((p: RgbColor) => RgbColor)) => {
      const n = typeof c === 'function' ? c(colors[selectedColor]) : c;
      // setup default empty request
      const obj = {
        seg: { col: [[] as number[], [] as number[], [] as number[]] },
        transition,
      };
      //set the specific color
      obj.seg.col[selectedColor] = [n.r, n.g, n.b, 0];
      void sendCommand(obj);
    },
    [colors, selectedColor, transition]
  );

  const updatePartialColor = (c: Partial<RgbColor>) => {
    updateColor((p: RgbColor) => ({ ...p, ...c }));
  };

  const selColor = colors[selectedColor];

  const colorEqual = (a: RgbColor, b: RgbColor): boolean => {
    return a.r === b.r && a.g === b.g && a.b === b.b;
  };

  return (
    <div class="tabinner d-grid gap-2 p-2">
      <Dropdown>
        <form class="px-4 py-3">
          <SettingItem name="picker" desc="Color Wheel" onSet={setCheck} settings={cSettings} />
          <SettingItem name="rgb" desc="RGB Sliders" onSet={setCheck} settings={cSettings} />
          <SettingItem name="quick" desc="Quick Colors" onSet={setCheck} settings={cSettings} />
          <SettingItem name="hex" desc="HEX color input" onSet={setCheck} settings={cSettings} />
        </form>
      </Dropdown>
      {cSettings.picker && (
        <RgbColorPicker
          color={selColor}
          class="mx-auto"
          onChangeComplete={(c, h) => {
            // If the user changed color, the new color value is 0, and the current color is black,
            // assume the user wants to pick a color and overwrite value to 100
            if (h.v === 0 && colorEqual(selColor, kBlack)) {
              c = hsvToRgb({ ...h, v: 100 });
            }
            updateColor(c);
          }}
        />
      )}
      {cSettings.rgb && (
        <div>
          <RgbSlider value={selColor} channel="r" color="red" onSet={updatePartialColor} />
          <RgbSlider value={selColor} channel="g" color="green" onSet={updatePartialColor} />
          <RgbSlider value={selColor} channel="b" color="blue" onSet={updatePartialColor} />
        </div>
      )}
      {info && info.leds.wv && (
        <div>
          <p class="m-0 p-0">White channel</p>
          <Slider value={128} />
        </div>
      )}

      {cSettings.quick && (
        <div class="mx-5 d-flex flex-wrap justify-content-center">
          {fixedColors.map(([name, val]) => (
            <div
              key={name}
              class={'quicksel' + cssAddIf(name === 'Black', 'qcsb')}
              onClick={() => updateColor(val)}
              title={name}
              style={{ backgroundColor: rgbToRgbString(val) }}
            />
          ))}
          <div
            class="quicksel bg-c-3"
            onClick={() => updateColor(hsvToRgb({ ...randColor() }))}
            title="Random"
          >
            R
          </div>
        </div>
      )}
      <div>
        {colors.map((c, i) => (
          <button
            key={i}
            data-selected={selectedColor === i}
            class="p-0 m-1 rounded-circle sz-48 btn txt-shadow b-thin"
            style={{ backgroundColor: rgbToRgbString(c) }}
            onClick={() => setSelectedColor(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {cSettings.hex && <HexEntry curColor={selColor} updateColor={updateColor} />}
      <ColorPalettes colors={colors} selected={segment.pal} setSelected={setPalette} />
    </div>
  );
};

import { JSX } from 'preact';

import { HueSatWheel } from './HueSatWheel';
import { ColorModel, ColorPickerBaseProps, AnyColor, HsvColor } from '../../types';
import { useColorManipulation } from '../../hooks/useColorManipulation';
import { formatClassName } from '../../utils/format';
import { clamp } from '../../utils/clamp';
import '../../css/styles.scss';
import { ColorSlider, SliderAdapter } from './ColorSlider';
import {
  hsvToRgb,
  hsvToRgbString,
  kelvinToRgb,
  rgbToHsv,
  rgbToKelvin,
} from 'color-picker/utils/convert';

interface Props<T extends AnyColor> extends Partial<ColorPickerBaseProps<T>> {
  colorModel: ColorModel<T>;
}

const hsvToKelvin = (h: HsvColor): number => {
  return rgbToKelvin(hsvToRgb(h));
};

const kelvinToHsv = (k: number): HsvColor => {
  return rgbToHsv(kelvinToRgb(k));
};

export type CssGradientType = 'linear' | 'radial' | 'conical';
export type CssGradientStops = [number, number | string][];

export function cssGradient(type: CssGradientType, direction: string, stops: CssGradientStops): string {
  return `${type}-gradient(${direction}, ${stops.map(([o, col]) => `${col} ${o}%`).join(',')})`;
}

function kelvinGradient(min: number, max: number): string {
  const stops: CssGradientStops = [];
  // const min = 2000;
  // const max = 10000;
  const numStops = 8;
  const range = max - min;
  for (let kelvin = min, stop = 0; kelvin < max; kelvin += range / numStops, stop += 1) {
    const { r, g, b } = kelvinToRgb(kelvin);
    stops.push([(100 / numStops) * stop, `rgb(${r},${g},${b})`]);
  }

  return cssGradient('linear', 'to right', stops);
}
const kSliderParams: SliderAdapter = {
  getPos: (hsv: HsvColor): number => {
    return clamp((hsvToKelvin(hsv) - 2000) / 8000);
  },

  setPos: (v: number, _hsv: HsvColor): HsvColor => {
    const k = v * 8000 + 2000;
    return kelvinToHsv(k);
  },

  getBackground: (_hsv: HsvColor) => {
    return kelvinGradient(2000, 10000);
  },
};

const vSliderParams: SliderAdapter = {
  getPos: (hsv: HsvColor): number => hsv.v / 100,

  setPos: (v: number, hsv: HsvColor): HsvColor => ({ ...hsv, v: v * 100 }),

  getBackground: (hsv: HsvColor) =>
    `linear-gradient(to right, rgb(0,0,0) 0%, ${hsvToRgbString({ ...hsv, v: 100 })} 100%)`,
};

export const ColorPicker = <T extends AnyColor>({
  class: cl,
  colorModel,
  color = colorModel.defaultColor,
  onChange,
  onChangeComplete,
  ...rest
}: Props<T>): JSX.Element => {
  const [hsv, updateHsv, completeChange] = useColorManipulation<T>(
    colorModel,
    color,
    onChange,
    onChangeComplete
  );

  const nodeClass = formatClassName(['color-picker', cl]);

  return (
    <div {...rest} class={nodeClass}>
      <HueSatWheel hsv={hsv} onChange={updateHsv} onChangeComplete={completeChange} />
      <ColorSlider
        adapter={vSliderParams}
        hsv={hsv}
        onChange={updateHsv}
        onChangeComplete={completeChange}
      />
      <ColorSlider
        adapter={kSliderParams}
        hsv={hsv}
        onChange={updateHsv}
        onChangeComplete={completeChange}
      />
    </div>
  );
};

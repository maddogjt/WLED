import { round } from './round';
import { RgbColor, HsvColor } from '../types';
import { clamp } from './clamp';

/**
 * Valid CSS <angle> units.
 * https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
const angleUnits: Record<string, number> = {
  grad: 360 / 400,
  turn: 360,
  rad: 360 / (Math.PI * 2),
};
const { log, pow, floor } = Math;
const cclamp = (n: number) => clamp(n, 0, 255);

export const parseHue = (value: string, unit = 'deg'): number => {
  return Number(value) * (angleUnits[unit] || 1);
};

export const hsvToRgb = ({ h, s, v }: HsvColor): RgbColor => {
  h = (h / 360) * 6;
  s = s / 100;
  v = v / 100;

  const hh = Math.floor(h),
    b = v * (1 - s),
    c = v * (1 - (h - hh) * s),
    d = v * (1 - (1 - h + hh) * s),
    module = hh % 6;

  return {
    r: round([v, c, b, b, d, v][module] * 255),
    g: round([d, v, v, c, b, b][module] * 255),
    b: round([b, b, d, v, v, c][module] * 255),
  };
};

export const hsvToRgbString = (hsv: HsvColor): string => {
  const { r, g, b } = hsvToRgb(hsv);
  return `rgb(${r}, ${g}, ${b})`;
};

export const rgbToRgbString = ({r, g, b}: RgbColor): string => {
  return `rgb(${r}, ${g}, ${b})`;
};


export const hsvStringToHsv = (hsvString: string): HsvColor => {
  const matcher =
    /hsva?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
  const match = matcher.exec(hsvString);

  if (!match) return { h: 0, s: 0, v: 0 };

  return roundHsv({
    h: parseHue(match[1], match[2]),
    s: Number(match[3]),
    v: Number(match[4]),
  });
};

export const rgbStringToHsv = (rgbString: string): HsvColor => {
  const matcher =
    /rgba?\(?\s*(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
  const match = matcher.exec(rgbString);

  if (!match) return { h: 0, s: 0, v: 0 };

  return rgbToHsv({
    r: Number(match[1]) / (match[2] ? 100 / 255 : 1),
    g: Number(match[3]) / (match[4] ? 100 / 255 : 1),
    b: Number(match[5]) / (match[6] ? 100 / 255 : 1),
  });
};

export const rgbToHsv = ({ r, g, b }: RgbColor): HsvColor => {
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);

  // prettier-ignore
  const hh = delta
    ? max === r
      ? (g - b) / delta
      : max === g
        ? 2 + (b - r) / delta
        : 4 + (r - g) / delta
    : 0;

  return {
    h: round(60 * (hh < 0 ? hh + 6 : hh)),
    s: round(max ? (delta / max) * 100 : 0),
    v: round((max / 255) * 100),
  };
};

export const roundHsv = (hsv: HsvColor): HsvColor => ({
  h: round(hsv.h),
  s: round(hsv.s),
  v: round(hsv.v),
});

export const kelvinToRgb = (temp: number): RgbColor => {
  temp = temp / 100;
  let red, blue, green;

  if (temp <= 66) {
    red = 255;
    green = 99.4708025861 * log(temp) - 161.1195681661;
    blue = temp <= 19 ? 0 : 138.5177312231 * log(temp - 10) - 305.0447927307;
  } else {
    red = 329.698727466 * pow(temp - 60, -0.1332047592);
    green = 288.1221695283 * pow(temp - 60, -0.0755148492);
    blue = 255;
  }

  return {
    r: cclamp(floor(red)),
    g: cclamp(floor(green)),
    b: cclamp(floor(blue)),
  };
};

const KELVIN_MIN = 2000;
const KELVIN_MAX = 10000;
export function rgbToKelvin(rgb: RgbColor): number {
  const eps = 0.4;
  let minTemp = KELVIN_MIN;
  let maxTemp = KELVIN_MAX;
  let temp = KELVIN_MIN;
  while (maxTemp - minTemp > eps) {
    temp = (maxTemp + minTemp) * 0.5;
    const { r, b } = kelvinToRgb(temp);
    if (b / r >= rgb.b / rgb.r) {
      maxTemp = temp;
    } else {
      minTemp = temp;
    }
  }
  return temp;
}

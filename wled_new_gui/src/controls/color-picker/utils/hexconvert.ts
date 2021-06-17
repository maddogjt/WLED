import { RgbColor, HsvColor } from '../types';
import { rgbToHsv, hsvToRgb } from './convert';

export const hexToHsv = (hex: string): HsvColor => rgbToHsv(hexToRgb(hex));

export const hexToRgb = (hex: string): RgbColor => {
  if (hex[0] === '#') hex = hex.substr(1);

  if (hex.length < 6) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }

  return {
    r: parseInt(hex.substr(0, 2), 16),
    g: parseInt(hex.substr(2, 2), 16),
    b: parseInt(hex.substr(4, 2), 16),
  };
};

export const hsvToHex = (hsv: HsvColor): string => rgbToHex(hsvToRgb(hsv));

const format = (number: number) => {
  const hex = number.toString(16);
  return hex.length < 2 ? `0${hex}` : hex;
};

export const rgbToHex = ({ r, g, b }: RgbColor): string => {
  return `#${format(r)}${format(g)}${format(b)}`;
};

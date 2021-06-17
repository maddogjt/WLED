import { JSX } from 'preact';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

export type ObjectColor = RgbColor | HsvColor;

export type AnyColor = string | ObjectColor;

export interface ColorModel<T extends AnyColor> {
  defaultColor: T;
  toHsv: (defaultColor: T) => HsvColor;
  fromHsv: (hsv: HsvColor) => T;
  equal: (first: T, second: T) => boolean;
}

type ColorPickerHTMLAttributes = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'color' | 'onChange' | 'onChangeCapture'
>;

export interface ColorPickerBaseProps<T extends AnyColor> extends ColorPickerHTMLAttributes {
  color: T;
  onChange: (newColor: T, hsvColor: HsvColor) => void;
  onChangeComplete: (newColor: T, hsvColor: HsvColor) => void;
}

import { JSX } from 'preact';

import { ColorPicker } from './common/ColorPicker';
import { ColorModel, ColorPickerBaseProps, HsvColor } from '../types';
import { equalColorObjects } from '../utils/compare';

const colorModel: ColorModel<HsvColor> = {
  defaultColor: { h: 0, s: 0, v: 0 },
  toHsv: (c) => c,
  fromHsv: (c) => c,
  equal: equalColorObjects,
};

export const HsvColorPicker = (props: Partial<ColorPickerBaseProps<HsvColor>>): JSX.Element => (
  <ColorPicker {...props} colorModel={colorModel} />
);

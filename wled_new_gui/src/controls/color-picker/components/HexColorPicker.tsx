import { JSX } from 'preact';

import { ColorPicker } from './common/ColorPicker';
import { ColorModel, ColorPickerBaseProps } from '../types';
import { equalHex } from '../utils/hexcompare';
import { hexToHsv, hsvToHex } from '../utils/hexconvert';

const colorModel: ColorModel<string> = {
  defaultColor: '000',
  toHsv: hexToHsv,
  fromHsv: hsvToHex,
  equal: equalHex,
};

export const HexColorPicker = (props: Partial<ColorPickerBaseProps<string>>): JSX.Element => (
  <ColorPicker {...props} colorModel={colorModel} />
);

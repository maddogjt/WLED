import { hexToRgb } from './hexconvert';
import { equalColorObjects } from './compare';

export const equalHex = (first: string, second: string): boolean => {
  if (first.toLowerCase() === second.toLowerCase()) return true;

  // To compare colors like `#FFF` and `ffffff` we convert them into RGB objects
  return equalColorObjects(hexToRgb(first), hexToRgb(second));
};

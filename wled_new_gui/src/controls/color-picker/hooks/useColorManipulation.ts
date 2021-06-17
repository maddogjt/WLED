import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { ColorModel, AnyColor, HsvColor } from '../types';
import { equalColorObjects } from '../utils/compare';
import { useEventCallback } from './useEventCallback';

export function useColorManipulation<T extends AnyColor>(
  colorModel: ColorModel<T>,
  color: T,
  onChange?: (color: T, hsvColor: HsvColor) => void,
  onChangeComplete?: (color: T, hsvColor: HsvColor) => void
): [HsvColor, (color: Partial<HsvColor>) => void, () => void] {
  // Save onChange callback in the ref for avoiding "useCallback hell"
  const onChangeCallback = useEventCallback<[T, HsvColor]>(([c, h]) => onChange?.(c, h));
  const onChangeCompleteCallback = useEventCallback<[T, HsvColor]>(([c, h]) =>
    onChangeComplete?.(c, h)
  );

  // No matter which color model is used (HEX, RGB),
  // all internal calculations are based on HSV model
  const [hsv, updateHsv] = useState<HsvColor>(() => colorModel.toHsv(color));

  // By using this ref we're able to prevent extra updates
  // and the effects recursion during the color conversion
  const cache = useRef({ color, hsv });

  // Update local HSV-value if `color` property value is changed,
  // but only if that's not the same color that we just sent to the parent
  useEffect(() => {
    if (!colorModel.equal(color, cache.current.color)) {
      const newHsv = colorModel.toHsv(color);
      cache.current = { hsv: newHsv, color };
      updateHsv(newHsv);
    }
  }, [color, colorModel]);

  // Trigger `onChange` callback only if an updated color is different from cached one;
  // save the new color to the ref to prevent unnecessary updates
  useEffect(() => {
    let newColor;
    if (!equalColorObjects(hsv, cache.current.hsv)) {
      newColor = colorModel.fromHsv(hsv);
      cache.current = { hsv, color: newColor };
      onChangeCallback([newColor, hsv]);
    }
  }, [hsv, colorModel, onChangeCallback]);

  // Merge the current HSV color object with updated params.
  // For example, when a child component sends `h` or `s` only
  const handleChange = useCallback((params: Partial<HsvColor>) => {
    updateHsv((current) => Object.assign({}, current, params));
  }, []);

  const handleChangeComplete = useCallback(() => {
    if (onChangeCompleteCallback)
      onChangeCompleteCallback([cache.current.color, cache.current.hsv]);
  }, [onChangeCompleteCallback]);

  return [hsv, handleChange, handleChangeComplete];
}

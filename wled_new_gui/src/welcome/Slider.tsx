import { JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export function Slider(props: {
  value: number;
  onChange?: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
  onInput?: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
  color?: string;
  min?: number;
  max?: number;
  class?: string;
}): JSX.Element {
  const [value, setValue] = useState(props.value ?? 0);
  const min = props.min ?? 0;
  const max = props.max ?? 255;
  const percent = Number(((value - min) * 100) / (max - min));

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);
  return (
    <div
      class={`${props.class ?? ''} rangeInput il`}
      style={`--percent: ${percent}%; --progressBg: ${props.color ?? '#fff'}`}
    >
      <input
        class="sliderinput noslide"
        onInput={(e) => {
          setValue(e.currentTarget.valueAsNumber);
          props.onInput?.(e);
        }}
        onChange={props.onChange}
        max={max}
        min={min}
        type="range"
        value={value}
      />
      <div class="outwrap">
        <output value={value} />
      </div>
    </div>
  );
}

import { JSX } from 'preact';
import { useMemo } from 'preact/hooks';
import { Settings } from '../features/settings';
import { Prop } from './pathProps';
import { range } from './utils';

export type TPin = {
  path: string;
  pin: number;
  section: string;
};

const rpin = { path: '', pin: -1, section: 'reserved' };
const reservedPins = [...range(6, 12)].map((p) => ({ ...rpin, pin: p }));
export function usePins(settings: Settings): TPin[] {
  const { hw } = settings;
  return useMemo(() => {
    const pins: TPin[] = [...reservedPins];
    pins.push({ pin: hw.relay.pin, path: 'hw.relay.pin', section: 'relay' });
    pins.push({ pin: hw.ir.pin, path: 'hw.ir.pin', section: 'ir' });
    hw.btn.ins.forEach((b, i) =>
      b.pin.forEach((pin, j) =>
        pins.push({ pin, path: `hw.btn.ins.${i}.pin.${j}`, section: 'btn' })
      )
    );
    hw.led.ins.forEach((b, i) =>
      b.pin.forEach((pin, j) =>
        pins.push({ pin, path: `hw.led.ins.${i}.pin.${j}`, section: 'led' })
      )
    );

    function findPins(section: string, path: (string | number)[], obj: any, isArrayElem?: boolean) {
      if (Array.isArray(obj)) {
        obj.forEach((v, i) => findPins(section, [...path, i], v, true));
      } else if (typeof obj === 'object') {
        Object.entries(obj).forEach(([k, v]) => findPins(section, [...path, k], v));
      } else {
        const isPin = (path[path.length - (isArrayElem ? 2 : 1)] as string).substr(-3) === 'pin';
        if (isPin && typeof obj === 'number' && obj >= 0) {
          pins.push({ pin: obj, path: path.join('.'), section });
        }
      }
      // if (!Array.isArray(obj) && typeof obj === 'object') {
      //   for (const [name, value] of Object.entries(obj)) {
      //     if (isObject(value)) {
      //       findPins(section, [...path, name], value);
      //     } else if ('pin' == name.replace('[]', '').substr(-3)) {
      //       console.log(name);
      //       const p = Array.isArray(value) ? value : [value];
      //       p.filter((v) => v >= 0).forEach((v) => {
      //       });
      //     } else if (Array.isArray(value)) {
      //       value.forEach((v) => findPins(section, path, v));
      //     }
      //   }
      // }
    }

    Object.entries(settings.um).forEach(([k, v]) => findPins(k, ['um', k], v));

    return pins.filter((p) => p.pin >= 0);
  }, [hw.btn.ins, hw.ir.pin, hw.led.ins, hw.relay.pin, settings.um]);
}

export function PinInput(
  props: { pins: TPin[]; pId: string } & (Prop<number> | Prop<number | undefined>) &
    Omit<JSX.HTMLAttributes<HTMLInputElement>, 'style' | 'onInput' | 'value'>
): JSX.Element {
  function checkPin(pins: TPin[], path: string, pin?: number) {
    if (pin === -1) {
      return true;
    }

    return !pins.some((p) => p.pin === pin && p.path !== path);
  }
  return (
    <input
      value={props.value}
      type="number"
      class={`xs ${props.class ?? ''}`}
      min="-1"
      max="40"
      step="1"
      {...props}
      onInput={(e) => props.set(e.currentTarget.valueAsNumber)}
      style={{
        color: checkPin(props.pins, props.pId, props.value) ? '#fff' : '#f00',
      }}
    />
  );
}

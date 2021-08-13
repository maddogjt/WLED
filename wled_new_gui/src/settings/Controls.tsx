import { JSX } from 'preact';
import { Prop } from './pathProps';

export function wikiUrl(page: string): string {
  return wledUrl(`wiki/${page}`);
}

export function wledUrl(page: string): string {
  return `https://github.com/Aircoookie/WLED/${page}`;
}

export function CheckInput(
  props: (Prop<boolean> | Prop<number> | Prop<boolean | undefined>) &
    Omit<JSX.HTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'checked'>
): JSX.Element {
  const { value, set, ...rest } = props;
  const v = typeof value === 'number' ? value !== 0 : value;
  const s =
    typeof value === 'number'
      ? (v: boolean) => (set as (v: number) => void)(v ? 1 : 0)
      : (set as (v: boolean) => void);
  return (
    <input type="checkbox" checked={v} onChange={(e) => s(e.currentTarget.checked)} {...rest} />
  );
}

export const convertInvert = {
  to: (v: boolean): boolean => !v,
  from: (v: boolean): boolean => !v,
};

export function ConvertCheckInput<T>(
  props: Prop<T> &
    Omit<JSX.HTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'checked'> & {
      to: (v: T) => boolean;
      from: (v: boolean, prev: T) => T;
    }
): JSX.Element {
  const { value, set, to, from, ...rest } = props;
  return (
    <input
      type="checkbox"
      checked={to(value)}
      onChange={(e) => set(from(e.currentTarget.checked, value))}
      {...rest}
    />
  );
}

export function TextInput(
  props: { updateOnChange?: boolean } & (Prop<string> | Prop<string | undefined>) &
    Omit<JSX.HTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onInput'>
): JSX.Element {
  const { value, set, updateOnChange, ...rest } = props;
  return (
    <input
      value={value}
      {...{
        [updateOnChange ? 'onChange' : 'onInput']: (
          e: JSX.TargetedEvent<HTMLInputElement, Event>
        ) => set(e.currentTarget.value),
      }}
      {...rest}
    />
  );
}

export function NumInput(
  props: { updateOnChange?: boolean } & (Prop<number> | Prop<number | undefined>) &
    Omit<JSX.HTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onInput'>
): JSX.Element {
  const { value, set, updateOnChange, ...rest } = props;
  return (
    <input
      type="number"
      value={value}
      {...{
        [updateOnChange ? 'onChange' : 'onInput']: (
          e: JSX.TargetedEvent<HTMLInputElement, Event>
        ) => set(e.currentTarget.valueAsNumber),
      }}
      {...rest}
    />
  );
}

export function IpAddress(props: Prop<number[]> | Prop<number[] | undefined>): JSX.Element {
  const addr = props.value ?? [0, 0, 0, 0];
  const update = (idx: number, val: number) => {
    const newAddr = [...(props.value ?? [0, 0, 0, 0])];
    newAddr[idx] = val;
    props.set(newAddr);
  };

  const iprops: JSX.HTMLAttributes<HTMLInputElement> = {
    type: 'number',
    min: 0,
    max: 255,
    step: 1,
    class: 'ip',
    required: true,
  };
  return (
    <>
      <input
        {...iprops}
        value={addr[0]}
        onChange={(e) => update(0, e.currentTarget.valueAsNumber)}
      />
      {' . '}
      <input
        {...iprops}
        value={addr[1]}
        onChange={(e) => update(1, e.currentTarget.valueAsNumber)}
      />
      {' . '}
      <input
        {...iprops}
        value={addr[2]}
        onChange={(e) => update(2, e.currentTarget.valueAsNumber)}
      />
      {' . '}
      <input
        {...iprops}
        value={addr[3]}
        onChange={(e) => update(3, e.currentTarget.valueAsNumber)}
      />
    </>
  );
}

export function Desc(props: { desc: string } & JSX.HTMLAttributes<HTMLDivElement>): JSX.Element {
  const { desc, children, ...other } = props;
  return (
    <div {...other}>
      {desc}
      {children}
    </div>
  );
}

export function Select(
  props: (Prop<number> | Prop<number | undefined>) &
    Omit<JSX.HTMLAttributes<HTMLSelectElement>, 'value' | 'onChange' | 'onInput'>
): JSX.Element {
  const { value, set, ...rest } = props;
  return <select value={value} onChange={(e) => set(parseInt(e.currentTarget.value))} {...rest} />;
}

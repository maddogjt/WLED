import { JSX } from 'preact';
import { Prop } from './pathProps';

export function wikiUrl(page: string): string {
  return wledUrl(`wiki/${page}`);
}

export function wledUrl(page: string): string {
  return `https://github.com/Aircoookie/WLED/${page}`;
}

function isNumber(
  props: Prop<boolean> | Prop<number> | Prop<boolean | undefined>
): props is Prop<number> {
  return typeof props.pvalue === 'number';
}

export function CheckInput(
  props: (Prop<boolean> | Prop<number> | Prop<boolean | undefined>) &
    JSX.HTMLAttributes<HTMLInputElement> & {
      trueValue?: number;
      falseValue?: number;
    }
): JSX.Element {
  const v = isNumber(props) ? props.pvalue !== 0 : props.pvalue;
  const s = isNumber(props)
    ? (v: boolean) => props.set(v ? props.trueValue ?? 1 : props.falseValue ?? 0)
    : props.set;
  return (
    <input type="checkbox" checked={v} {...props} onChange={(e) => s(e.currentTarget.checked)} />
  );
}

export function ConvertCheckInput<T>(
  props: Prop<T> &
    JSX.HTMLAttributes<HTMLInputElement> & {
      to: (v: T) => boolean;
      from: (v: boolean, prev: T) => T;
    }
): JSX.Element {
  return (
    <input
      type="checkbox"
      checked={props.to(props.pvalue)}
      {...props}
      onChange={(e) => props.set(props.from(e.currentTarget.checked, props.pvalue))}
    />
  );
}

export function TextInput(
  props: (Prop<string> | Prop<string | undefined>) & JSX.HTMLAttributes<HTMLInputElement>
): JSX.Element {
  return (
    <input
      value={props.pvalue}
      {...props}
      class={`m-1 ${props.class ?? ''}`}
      onChange={(e) => props.set(e.currentTarget.value)}
    />
  );
}

export function NumInput(
  props: (Prop<number> | Prop<number | undefined>) & JSX.HTMLAttributes<HTMLInputElement>
): JSX.Element {
  return (
    <input
      value={props.pvalue}
      type="number"
      {...props}
      class={`m-1 ${props.class ?? ''}`}
      onChange={(e) => props.set(e.currentTarget.valueAsNumber)}
    />
  );
}

export function IpAddress(props: Prop<number[]> | Prop<number[] | undefined>): JSX.Element {
  const addr = props.pvalue ?? [0, 0, 0, 0];
  const update = (idx: number, val: number) => {
    const newAddr = [...(props.pvalue ?? [0, 0, 0, 0])];
    newAddr[idx] = val;
    props.set(newAddr);
  };
  return (
    <>
      <input
        type="number"
        min="0"
        max="255"
        required
        value={addr[0]}
        onChange={(e) => update(0, e.currentTarget.valueAsNumber)}
      />{' '}
      .
      <input
        type="number"
        min="0"
        max="255"
        required
        value={addr[1]}
        onChange={(e) => update(1, e.currentTarget.valueAsNumber)}
      />{' '}
      .
      <input
        type="number"
        min="0"
        max="255"
        required
        value={addr[2]}
        onChange={(e) => update(2, e.currentTarget.valueAsNumber)}
      />{' '}
      .
      <input
        type="number"
        min="0"
        max="255"
        required
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
  props: (Prop<number> | Prop<number | undefined>) & JSX.HTMLAttributes<HTMLSelectElement>
): JSX.Element {
  return (
    <select
      value={props.pvalue}
      onChange={(e) => {
        props.set(parseInt(e.currentTarget.value));
      }}
      {...props}
    />
  );
}

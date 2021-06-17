import { JSX } from 'preact';

interface Props {
  top?: number;
  left: number;
}

export const Pointer = ({ left, top = 0.5 }: Props): JSX.Element => {
  const style = {
    top: `${top * 100}%`,
    left: `${left * 100}%`,
  };

  const r = 10;
  return (
    <svg class="pointer" viewBox={`-${r} -${r} ${2 * r} ${2 * r}`} style={style}>
      <circle r={r} fill="none" stroke-width="2px" stroke="#000" />
      <circle r={r - 2} fill="none" stroke-width="2px" stroke="#fff" />
    </svg>
  );
};

import { JSX } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { useSelector, useSelector2 } from 'predux/preact';
import { sendCommand } from '../features/connection';
import { selectEffects, selectState } from '../features/wledState';
import { Slider } from './Slider';
import { useStateFromProps } from './useStateFromProps';

function setSeg(val: any) {
  const obj = { seg: val };
  void sendCommand(obj, true, false);
}

export function Effects(): JSX.Element {
  const effects = useSelector(selectEffects);

  const segments = useSelector2(selectState, (s) => s.seg);
  const segment = useMemo(() => segments.find((s) => s.sel) ?? segments[0], [segments]);

  const [speed, setSpeed] = useStateFromProps(segment.sx, (s) => setSeg({ sx: s }));
  const [intensity, setIntensity] = useStateFromProps(segment.ix, (s) => setSeg({ ix: s }));
  const [effect, setEffect] = useStateFromProps(segment.fx, (s) => setSeg({ fx: s }));

  const [searchTerm, setSearchTerm] = useState('');

  const sorted = useMemo(() => {
    const eff2 = [...effects]
      .slice(1)
      .map((v: string, i: number) => {
        return { id: i + 1, name: v };
      })
      .sort((a, b) => (a.name < b.name ? -1 : 1));
    return [{ id: 0, name: 'Solid' }, ...eff2];
  }, [effects]);

  return (
    <div class="tabinner d-grid gap-1 p-2">
      <p class="m-0 p-0">Effect speed</p>
      <div class="staytop d-flex bg-c-1 align-items-center">
        <i class="icons color-d">&#xe325;</i>
        <Slider
          value={speed}
          onChange={(e) => setSpeed(e.currentTarget.valueAsNumber)}
          class="effectslider flex-fill"
        />
      </div>
      <p class="m-0 p-0">Effect intensity</p>
      <div class="staytop staytop2 d-flex bg-c-1 align-items-center">
        <i class="icons color-d">&#xe409;</i>
        <Slider
          value={intensity}
          onChange={(e) => setIntensity(e.currentTarget.valueAsNumber)}
          class="effectslider flex-fill"
        />
      </div>
      <p class="m-0 p-0 ">Effect mode</p>
      <div class="d-grid gap-3 effect-list sticky-list">
        <div class="position-relative" key="search">
          <input
            type="text"
            class="search w-100 m-0 form-control rounded-pill"
            placeholder="Search"
            value={searchTerm}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
          />
          <i class="icons" onClick={() => setSearchTerm('')}>
            &#xe38f;
          </i>
        </div>
        {sorted
          .filter((e) => e.name.toUpperCase().indexOf(searchTerm.toUpperCase()) !== -1)
          .map((e) => {
            return (
              <div
                key={e.id}
                data-selected={effect === e.id}
                data-sticky={e.id === 0}
                class="lstI btn"
                onClick={() => setEffect(e.id)}
              >
                {effect === e.id && (
                  <div class="seldot">
                    <div class="bg-c-f sz-12 rounded-circle" />
                  </div>
                )}
                <span class="text-nowrap">{e.name}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

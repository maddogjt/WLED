import { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { useSelector, useSelector2 } from 'predux/preact';
import { sendCommand } from '../features/connection';
import { selectInfo, selectState } from '../features/wledState';
import { cssAddIf } from './cssUtils';
import { Expander } from './Expander';
import { Slider } from './Slider';
import { useStateFromProps } from './useStateFromProps';

interface Segment {
  id: number;
  start: number;
  stop: number;
  len: number;
  grp: number;
  spc: number;
  on: boolean;
  bri: number;
  fx: number;
  sx: number;
  ix: number;
  pal: number;
  sel: boolean;
  rev: boolean;
  mi: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  col: any[];
}

interface Options {
  maxSeg: number;
  ledCount: number;
  segCount: number;
}

function updateSegment(s: number, start: number, stop: number, group?: number, spacing?: number) {
  const obj = { seg: { id: s, start, stop, grp: group, spc: spacing } };
  void sendCommand(obj);
}

function deleteSegment(s: number) {
  const obj = { seg: { id: s, stop: 0 } };
  void sendCommand(obj);
}

function SegmentHeader(props: {
  name: string;
  onClick?: () => void;
  inst: Segment;
  setInst: (s: Segment) => void;
}) {
  return (
    <>
      <div class="segmentheader" onClick={() => props.onClick?.()}>
        {props.name}
      </div>
      <div class="pid">
        <input
          class="form-check-input"
          type="checkbox"
          onChange={(e) => props.setInst({ ...props.inst, sel: e.currentTarget.checked })}
          checked={props.inst.sel}
        />
      </div>
    </>
  );
}

export function Segment(props: { segment: Segment; options: Options }): JSX.Element {
  const { options } = props;
  const [inst, setInst] = useStateFromProps(props.segment);
  const i = inst.id;

  const getLedCountStr = () => {
    const count = inst.stop - inst.start;
    let res = '(delete)';
    if (count > 0) {
      res = `${count} LED${count > 1 ? 's' : ''}`;
    }
    let grp = inst.grp;
    const spc = inst.spc;

    if (grp == 0) grp = 1;
    const virt = Math.ceil(count / (grp + spc));
    if (!isNaN(virt) && (grp > 1 || spc > 0)) {
      res += ` (${virt} virtual)`;
    }

    return res;
  };

  return (
    <Expander header={<SegmentHeader name={`Segment ${i}`} inst={inst} setInst={setInst} />}>
      <div class="position-relative px-2 text-start d-grid gap-1">
        <table class="segt">
          <tr>
            <td>Start LED</td>
            <td>Stop LED</td>
          </tr>
          <tr>
            <td>
              <input
                class="my-1 form-control"
                type="number"
                min="0"
                max={options.ledCount - 1}
                value={inst.start}
                onInput={(e) => setInst((v) => ({ ...v, start: e.currentTarget.valueAsNumber }))}
              />
            </td>
            <td>
              <input
                class="my-1 form-control"
                id={`seg${i}e`}
                type="number"
                min="0"
                max={options.ledCount}
                value={inst.stop}
                onInput={(e) => setInst((v) => ({ ...v, stop: e.currentTarget.valueAsNumber }))}
              />
            </td>
          </tr>
          <tr>
            <td>Grouping</td>
            <td>Spacing</td>
          </tr>
          <tr>
            <td>
              <input
                class="my-1 form-control"
                type="number"
                min="1"
                max="255"
                onInput={(e) => setInst((v) => ({ ...v, grp: e.currentTarget.valueAsNumber }))}
                value={inst.grp}
              />
            </td>
            <td>
              <input
                class="my-1 form-control"
                type="number"
                min="0"
                max="255"
                onInput={(e) => setInst((v) => ({ ...v, spc: e.currentTarget.valueAsNumber }))}
                value={inst.spc}
              />
            </td>
          </tr>
        </table>
        <div class="note">{getLedCountStr()}</div>
        <div class="d-flex align-items-center">
          <i
            class={`icons clr-c-d pwr ${cssAddIf(inst.on, 'clr-c-f')}`}
            onClick={() => setInst({ ...inst, on: !inst.on })}
          >
            &#xe08f;
          </i>
          <Slider
            class="flex-fill"
            value={inst.bri}
            onChange={(e) => setInst({ ...inst, bri: e.currentTarget.valueAsNumber })}
            min={1}
            max={255}
          />
        </div>
        <div
          class="btn cnf-s"
          onClick={() => updateSegment(inst.id, inst.start, inst.stop, inst.grp, inst.spc)}
        >
          <i class="icons clr-c-d">&#xe390;</i>
        </div>
        {options.segCount > 1 && (
          <i
            class="icons clr-c-d del"
            id={`segd${i}`}
            onClick={() => deleteSegment(i)}
            /*onclick="delSeg(${i})"*/
          >
            &#xe037;
          </i>
        )}
        <label class="form-check form-check-label">
          <input
            class="form-check-input"
            type="checkbox"
            onChange={(e) => setInst({ ...inst, rev: e.currentTarget.checked })}
            checked={inst.rev}
          />
          Reverse direction
        </label>
        <label class="form-check form-check-label">
          <input
            type="checkbox"
            class="form-check-input"
            onChange={(e) => setInst({ ...inst, mi: e.currentTarget.checked })}
            checked={inst.mi}
          />
          Mirror effect
        </label>
      </div>
    </Expander>
  );
}

export function Segments(): JSX.Element {
  const segs = (useSelector2(selectState, (s) => s.seg) as Segment[]) ?? [];
  const info = useSelector(selectInfo);
  const [makeSeg, setMakeSeg] = useState(false);

  const [confirm, setConfirm] = useState(false);
  const maxSegments: number = info.leds.maxseg;
  // const segs = state.seg as Segment[];

  const options = {
    maxSeg: maxSegments,
    ledCount: info.leds.count,
    segCount: segs.length,
  };
  let lowestUnused = 0;
  for (const s of segs) {
    if (s.id === lowestUnused) {
      lowestUnused++;
    } else {
      break;
    }
  }

  return (
    <div class="tabinner d-grid gap-3 p-2 px-4">
      {segs.map((s, i) => {
        return <Segment key={i} segment={s} options={options} />;
      })}
      <div>
        {segs.length >= maxSegments ? (
          <span class="h">Maximum number of segments reached.</span>
        ) : makeSeg ? (
          <MakeSegment
            ledCount={info.leds.count}
            lowestUnused={lowestUnused}
            close={() => setMakeSeg(false)}
          />
        ) : (
          <button class="btn bg-c-2 w-100" onClick={() => setMakeSeg(true)}>
            <i class="icons mx-2">&#xe18a;</i>Add segment
          </button>
        )}
      </div>
      {segs.length > 1 && (
        <div>
          <button
            class={`btn bg-c-2 w-100 ${confirm ? 'bg-danger' : ''}`}
            /*onclick="rSegs()"*/
            onClick={() => setConfirm(true)}
          >
            {confirm ? 'Confirm reset' : 'Reset segments'}
          </button>
        </div>
      )}
    </div>
  );
}

function MakeSegment(props: {
  lowestUnused: number;
  ledCount: number;
  close: () => void;
}): JSX.Element {
  const { lowestUnused, ledCount } = props;
  const [startLed, setStartLed] = useState(0);
  const [endLed, setEndLed] = useState(ledCount);

  return (
    <div class="expander p-2 d-grid gap-2">
      <div class="segname newseg">New segment {lowestUnused}</div>
      <table class="segt w-100">
        <tr>
          <td class="segtd">Start LED</td>
          <td class="segtd">Stop LED</td>
          <td />
        </tr>
        <tr>
          <td class="segtd">
            <input
              class="segn form-control my-1"
              id="seg${lowestUnused}s"
              type="number"
              min="0"
              max={ledCount - 1}
              value={startLed}
              onInput={(e) => setStartLed(e.currentTarget.valueAsNumber)}
            />
          </td>
          <td class="segtd">
            <input
              class="segn form-control"
              id="seg${lowestUnused}e"
              type="number"
              min="0"
              max={ledCount}
              value={endLed}
              onInput={(e) => setEndLed(e.currentTarget.valueAsNumber)}
            />
          </td>
          <td>
            <i
              class="icons e-icon cnf half p-2"
              id="segc${lowestUnused}"
              onClick={() => {
                updateSegment(lowestUnused, startLed, endLed);
                props.close();
              }}
            >
              &#xe390;
            </i>
          </td>
        </tr>
      </table>
      <div class="h" id="seg${lowestUnused}len">
        {endLed - startLed} LEDs
      </div>
    </div>
  );
}

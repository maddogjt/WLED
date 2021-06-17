import { ComponentChildren, JSX } from 'preact';
import { useState } from 'preact/hooks';
import { useSelector } from 'predux/preact';
import { selectUiSettings } from '../features/localSettings';
import { PresetData, TPreset, TPresetUpdate, updatePreset } from '../features/presets';
import { Expander } from './Expander';

function getLowestUnusedP(presets: PresetData) {
  let l = 1;
  for (const key in presets) {
    if (key === l.toString()) l++;
  }
  if (l > 250) l = 250;
  return l;
}

function pName(i: number, p: TPreset) {
  let n = `Preset ${i}`;
  if (p && p.n) n = p.n;
  return n;
}

function qlName(p: TPreset) {
  return p?.ql ?? '';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveP(
  i: number,
  props: {
    pendingId: number;
    presets: PresetData;
    pendingName: string;
    useCurrentState: boolean;
    papi: string;
    includeBrightness: boolean;
    saveSegBounds: boolean;
    quickLoad: string;
  }
): string | undefined {
  const d = window.document;
  if (!d) return;
  let pI = props.pendingId;
  let warning: string | undefined;

  if (!pI || pI < 1) pI = i > 0 ? i : getLowestUnusedP(props.presets);

  let pN = props.pendingName;
  if (pN == '') pN = `Preset ${pI}`;

  let obj: TPresetUpdate = { psave: pI, n: pN };
  if (!props.useCurrentState) {
    const raw = props.papi;
    try {
      obj = JSON.parse(raw);
    } catch (e) {
      obj.win = raw;
      if (raw.length < 2) {
        return '&#9888; Please enter your API command first';
      } else if (raw.indexOf('{') > -1) {
        return '&#9888; Syntax error in custom JSON API command';
      } else if (raw.indexOf('Please') == 0) {
        return '&#9888; Please refresh the page before modifying this preset';
      }
    }
    obj.o = true;
  } else {
    obj.ib = props.includeBrightness;
    obj.sb = props.saveSegBounds;
  }
  //   obj.psave = pI;
  //   obj.n = pN;
  const pQN = props.quickLoad;
  if (pQN.length > 0) obj.ql = pQN;

  //   showToast("Saving " + pN + " (" + pI + ")");
  updatePreset(obj);
  //   if (obj.o) {
  //       const {psave, o, v, time, ...newObj} = obj;
  //       pJson[pI] = newObj;
  //     } else {
  //     pJson[pI] = {
  //       n: pN,
  //       win: "Please refresh the page to see this newly saved command.",
  //     };
  //     if (obj.win) pJson[pI].win = obj.win;
  //     if (obj.ql) pJson[pI].ql = obj.ql;
  //   }
  //   populatePresets();
  //   resetPUtil();
  return warning;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function savePC(
  i: number,

  pendingId: number,
  presets: PresetData,
  pendingName: string,
  useCurrentState: boolean,
  papi: string,
  includeBrightness: boolean,
  saveSegBounds: boolean,
  quickLoad: string
): string | undefined {
  const d = window.document;
  if (!d) return;
  let pI = pendingId;
  let warning: string | undefined;

  if (!pI || pI < 1) pI = i > 0 ? i : getLowestUnusedP(presets);

  let pN = pendingName;
  if (pN == '') pN = `Preset ${pI}`;

  let obj: TPresetUpdate = { psave: pI, n: pN };
  if (!useCurrentState) {
    const raw = papi;
    try {
      obj = JSON.parse(raw);
    } catch (e) {
      obj.win = raw;
      if (raw.length < 2) {
        return '&#9888; Please enter your API command first';
      } else if (raw.indexOf('{') > -1) {
        return '&#9888; Syntax error in custom JSON API command';
      } else if (raw.indexOf('Please') == 0) {
        return '&#9888; Please refresh the page before modifying this preset';
      }
    }
    obj.o = true;
  } else {
    obj.ib = includeBrightness;
    obj.sb = saveSegBounds;
  }
  const pQN = quickLoad;
  if (pQN.length > 0) obj.ql = pQN;

  updatePreset(obj);
  return warning;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PresetError(empty: boolean) {
  let hasBackup = false;
  let bckstr: string | null = '';
  try {
    bckstr = localStorage.getItem('wledP');
    if (bckstr && bckstr.length > 10) hasBackup = true;
  } catch (e) {}
  return (
    <div class="seg text-center">
      {empty ? `You have no presets yet!` : `Sorry, there was an issue loading your presets!`}

      {hasBackup && (
        <>
          <br />
          <br />
          {empty
            ? `However, there is backup preset data of a previous installation available.<br>
			(Saving a preset will hide this and overwrite the backup)`
            : `Here is a backup of the last known good state:`}
          <textarea id="bck" class="bg-c-2">
            {bckstr}
          </textarea>
          <br />
          <button class="btn btn-p" /*onclick="cpBck()"*/>Copy to clipboard</button>
        </>
      )}
    </div>
  );
  //   d.getElementById("pcont").innerHTML = cn;
  //   if (hasBackup) d.getElementById("bck").value = bckstr;
  //   );
}

type P = [string, TPreset];
function cmpP(a: P, b: P) {
  if (!a[1].n) return a[0] > b[0] ? 1 : -1;
  return a[1].n.localeCompare(b[1].n, undefined, { numeric: true });
}

function isObject(item: unknown) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function PresetHeader(props: { id: number; name: string; onClick?: () => void }) {
  const uiSettings = useSelector(selectUiSettings);
  return (
    <>
      <div class="presetheader" onClick={() => props.onClick?.()}>
        {props.name}
      </div>
      {uiSettings?.pid && <div class="pid">{props.id}</div>}
    </>
  );
}

export function Presets(props: {
  presets: PresetData;
  currentPreset: number;
  setCurrentPreset: (p: number) => void;
}): JSX.Element {
  const presets = { ...props.presets };
  delete presets['0'];

  const arr = Object.entries(presets).filter((v) => isObject(v[1]));
  arr.sort(cmpP);

  return (
    <>
      {arr.map((v) => {
        const id = parseInt(v[0]);
        return (
          <Expander
            key={id}
            data-selected={id === props.currentPreset}
            class="highlight-sel"
            header={
              <PresetHeader
                id={id}
                name={pName(id, props.presets[id])}
                onClick={() => props.setCurrentPreset(id)}
              />
            }
          >
            <MakePreset i={id} presets={props.presets} />
          </Expander>
        );
      })}
    </>
  );
  //   <Preset key={id} id={id} preset={v[1]} {...props} />;
  // })}

  //   d.getElementById("pcont").innerHTML = cn;
  //   if (added) {
  //     if (pmtLS != pmt && pmt != 0) {
  //       localStorage.setItem("wledPmt", pmt);
  //       pJson["0"] = {};
  //       localStorage.setItem("wledP", JSON.stringify(pJson));
  //     }
  //     pmtLS = pmt;
  //     for (let a = 0; a < is.length; a++) {
  //       let i = is[a];
  //       if (expanded[i + 100]) expand(i + 100, true);
  //     }
  //   } else {
  //     presetError(true);
  //   }
  //   updatePA();
  //   populateQL();
}

function papiVal(preset: TPreset) {
  if (!preset) return '';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { n, /*p,*/ ql, win, ...o } = preset;
  if (win) return win;
  return JSON.stringify(o);
}

export function LabeledInput(props: {
  class?: string;
  label: string;
  children: ComponentChildren;
}): JSX.Element {
  return (
    <div class={`form-group row d-flex align-items-center text-end ${props.class ?? ''}`}>
      <label class="col-8 px-0">{props.label}</label>
      <div class="col-4 d-flex align-items-center">{props.children}</div>
    </div>
  );
}

export function LabeledCheck(props: { label: string; children: ComponentChildren }): JSX.Element {
  return (
    <div class="form-group row d-flex align-items-center">
      <div class="col-2 d-flex align-items-center">{props.children}</div>
      <label class="col-10 px-0 text-start">{props.label}</label>
    </div>
  );
}

export function MakePreset(props: {
  i: number;
  setMakingPreset?: (b: boolean) => void;
  presets: PresetData;
}): JSX.Element {
  const { i } = props;
  const [useCurrentState, setUseCurrentState] = useState(i === 0);
  const [includeBrightness, setIncludeBrightness] = useState(true);
  const [saveSegBounds, setSaveSegBound] = useState(true);
  const [pendingId, setPendingId] = useState<number>(i === 0 ? getLowestUnusedP(props.presets) : i);
  const [quickLoad, setQuickLoad] = useState(qlName(props.presets[i]));
  const [pendingName, setPendingName] = useState(i > 0 ? pName(i, props.presets[i]) : '');
  const pendingInUse = (i === 0 || i !== pendingId) && props.presets[pendingId];
  const preset = props.presets[i];

  const savePreset = (): string | undefined => {
    let pI = pendingId;
    let warning: string | undefined;

    if (!pI || pI < 1) pI = i > 0 ? i : getLowestUnusedP(props.presets);

    let pN = pendingName;
    if (pN == '') pN = `Preset ${pI}`;

    let obj: TPresetUpdate = { psave: pI, n: pN };
    if (!useCurrentState) {
      const raw = papiVal(preset);
      try {
        obj = Object.assign({}, obj, JSON.parse(raw));
      } catch (e) {
        obj.win = raw;
        if (raw.length < 2) {
          return '&#9888; Please enter your API command first';
        } else if (raw.indexOf('{') > -1) {
          return '&#9888; Syntax error in custom JSON API command';
        } else if (raw.indexOf('Please') == 0) {
          return '&#9888; Please refresh the page before modifying this preset';
        }
      }
      obj.o = true;
    } else {
      obj.ib = includeBrightness;
      obj.sb = saveSegBounds;
    }
    const pQN = quickLoad;
    if (pQN.length > 0) obj.ql = pQN;

    updatePreset(obj);
    return warning;
  };

  const setText = (f: (v: string) => void): JSX.GenericEventHandler<HTMLInputElement> => {
    return (e) => {
      f(e.currentTarget.value);
    };
  };

  return (
    <div class="px-4 d-grid gap-1">
      <div class="form-group row justify-content-center">
        <input
          type="text"
          class="sz-w-200 form-control col-8 rounded-pill text-center"
          autocomplete="off"
          maxLength={32}
          value={pendingName}
          onInput={(e) => setPendingName(e.currentTarget.value)}
          placeholder="Enter name..."
        />
      </div>
      <div class="form-group d-flex align-items-center text-end justify-content-center">
        <label class="m-2">Quick load label</label>
        <div class="sz-w-60">
          <input
            type="text"
            class="form-control rounded-pill text-center"
            maxLength={2}
            value={quickLoad}
            onInput={setText(setQuickLoad)}
            id={`p${i}ql`}
            autocomplete="off"
          />
        </div>
      </div>
      <div class="note">(leave empty for no Quick load button)</div>
      <LabeledCheck label={i > 0 ? 'Overwrite with state' : 'Use current state'}>
        <input
          class="form-check-input"
          type="checkbox"
          checked={useCurrentState}
          onChange={(e) => setUseCurrentState(e.currentTarget.checked)}
        />
      </LabeledCheck>
      {useCurrentState ? (
        <>
          <LabeledCheck label="Include brightness">
            <input
              class="form-check-input"
              type="checkbox"
              checked={includeBrightness}
              onChange={(e) => setIncludeBrightness(e.currentTarget.checked)}
            />
          </LabeledCheck>
          <LabeledCheck label="Save segment bounds">
            <input
              class="form-check-input "
              type="checkbox"
              checked={saveSegBounds}
              onChange={(e) => setSaveSegBound(e.currentTarget.checked)}
            />{' '}
          </LabeledCheck>
        </>
      ) : (
        <div class="text-start" id={`p${i}o2`}>
          API command
          <textarea class="bg-c-2" id={`p${i}api`}>
            {papiVal(preset)}
          </textarea>
        </div>
      )}
      <div class="form-group d-flex align-items-center text-end justify-content-center">
        <label class="m-2">Save to ID</label>
        <div class="sz-w-60">
          <input
            class="form-control"
            id={`p${i}id`}
            type="number"
            onInput={(e) => setPendingId(e.currentTarget.valueAsNumber)}
            max={250}
            min={1}
            value={pendingId}
          />
        </div>
      </div>
      <div>
        <button class="btn btn-p" onClick={() => savePreset()}>
          <i class="icons mx-2">&#xe390;</i>
          {i > 0 ? 'Save changes' : 'Save preset'}
        </button>
      </div>

      <div>
        {i > 0 ? (
          <button
            class="btn btn-p" /*onclick="delP(' +
        i +
        ')"*/
          >
            <i class="icons mx-2">&#xe037;</i>Delete preset
          </button>
        ) : (
          <button class="btn btn-p" onClick={() => props.setMakingPreset?.(false)}>
            Cancel
          </button>
        )}
      </div>
      {pendingInUse && (
        <div class={`pwarn ${i > 0 ? 'mb-1' : ''} c`}>
          &#9888; Overwriting {pName(pendingId, props.presets[pendingId])}!
        </div>
      )}
      {i > 0 && <div class="h">ID {i}</div>}
    </div>
  );
}

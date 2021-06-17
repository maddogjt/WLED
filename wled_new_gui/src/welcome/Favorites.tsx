import { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { useSelector } from 'predux/preact';
import { sendCommand } from '../features/connection';
import { selectPresets } from '../features/presets';
import { selectState } from '../features/wledState';
import { LabeledInput, MakePreset, Presets } from './Presets';

export function Favorites(): JSX.Element {
  const presets = useSelector(selectPresets) ?? [];
  const state = useSelector(selectState);
  const [makingPreset, setMakingPreset] = useState(false);
  const [currentPreset, setCurrentPreset] = useState(-1);

  const quickLoad = Object.entries(presets ?? {}).filter((e) => e[0] !== '0' && e[1].ql);
  return (
    <div class="tabinner d-grid gap-2 p-2">
      {!makingPreset ? (
        <button class="btn bg-c-2" onClick={() => setMakingPreset(true)}>
          <i class="icons mx-2">&#xe18a;</i>Create preset
        </button>
      ) : (
        <div class="expander pres">
          <div class="presetheader newseg">New preset</div>
          <MakePreset i={0} setMakingPreset={setMakingPreset} presets={presets} />
        </div>
      )}

      {quickLoad.length > 0 && (
        <>
          <p class="m-0 py-1">Quick load</p>
          <ul class="list-unstyled d-flex flex-wrap p-0 my-0 justify-content-center">
            {quickLoad.map((e) => {
              return (
                <li key={e[0]}>
                  <button
                    class="btn sz-40 m-1 highlight-sel"
                    data-selected={parseInt(e[0]) === currentPreset}
                    onClick={() => setCurrentPreset(parseInt(e[0]))}
                  >
                    {e[1].ql}
                  </button>
                </li>
              );
            })}
          </ul>
          <p class="m-0 py-1">All presets</p>
        </>
      )}
      {/* <div id="pcont"> */}
      {presets && (
        <Presets
          presets={presets}
          currentPreset={currentPreset}
          setCurrentPreset={setCurrentPreset}
        />
      )}
      <LabeledInput label="Preset cycle">
        <input
          class="form-check-input align-self-center m-0"
          type="checkbox"
          // checked={useCurrentState}
          // onChange={(e) => setUseCurrentState(e.currentTarget.checked)}
        />
      </LabeledInput>
      <LabeledInput label="First preset">
        <input class="form-control labeled-input" type="number" min="1" max="249" value="1" />
      </LabeledInput>
      <LabeledInput label="Last preset">
        <input class="form-control labeled-input" type="number" min="2" max="250" value="3" />
      </LabeledInput>
      <LabeledInput label="Transition">
        <input
          class="form-control labeled-input"
          type="number"
          min="0.2"
          max="6553.5"
          step="0.1"
          value="1.2"
        />
        <span class="input-label">s</span>
      </LabeledInput>
      <LabeledInput label="Time per preset">
        <input
          id="cyctt"
          class="form-control labeled-input"
          type="number"
          min="0"
          max="65.5"
          step="0.1"
          value={state.transition / 10}
          onChange={(e) => sendCommand({ transition: e.currentTarget.valueAsNumber * 10 })}
        />
        <span class="input-label">s</span>
      </LabeledInput>
    </div>
  );
}

import { JSX } from 'preact';
import { useMemo } from 'preact/hooks';
import { useSelector } from 'predux/preact';
import { selectSettings, Settings } from '../features/settings';
import { useStateFromProps } from '../welcome/useStateFromProps';
import { bindSetter } from './Accessors';
import {
  CheckInput,
  ConvertCheckInput,
  Desc,
  NumInput,
  Select,
  TextInput,
  wikiUrl,
} from './Controls';
import { bindGetPathProp, bindGetPathPropRaw, Prop } from './pathProps';
import { range } from './utils';

function makeTimerList(input: TPreset[]): TPreset[] {
  const result: TPreset[] = [...range(0, 10)].map<TPreset>((_v) => ({
    en: 0,
    hour: 0,
    min: 0,
    macro: 0,
    dow: 127,
  }));
  let pi = 8;
  input.forEach((p, i) => {
    result[p.hour === 255 ? pi++ : i] = p;
  });
  return result;
}

export function SettingsTime(): JSX.Element {
  const [settings, setSettings] = useStateFromProps(useSelector(selectSettings));
  const getProp = bindGetPathProp(settings, setSettings);
  const getPropRaw = bindGetPathPropRaw(settings, setSettings);
  const setSetting = bindSetter(setSettings);

  const timers = useMemo(() => makeTimerList(settings.timers.ins), [settings.timers.ins]);

  return (
    <form method="post" class="settings">
      <div class="helpB">
        <a href={wikiUrl('Settings#time-settings')} target="_blank" rel="noreferrer">
          <button type="button">?</button>
        </a>
      </div>
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="submit">Save</button>
      <hr />
      <h2>Time setup</h2>
      <Desc desc="Get time from NTP server: ">
        <CheckInput {...getProp('if.ntp.en')} />
      </Desc>
      <div>
        <TextInput {...getProp('if.ntp.host')} maxLength={32} />
      </div>
      <Desc desc="Use 24h format: ">
        <CheckInput {...getProp('if.ntp.ampm')} />
      </Desc>
      <Desc desc="Time zone: ">
        <Select {...getProp('if.ntp.tz')}>
          <option value="0" selected>
            GMT(UTC)
          </option>
          <option value="1">GMT/BST</option>
          <option value="2">CET/CEST</option>
          <option value="3">EET/EEST</option>
          <option value="4">US-EST/EDT</option>
          <option value="5">US-CST/CDT</option>
          <option value="6">US-MST/MDT</option>
          <option value="7">US-AZ</option>
          <option value="8">US-PST/PDT</option>
          <option value="9">CST(AWST)</option>
          <option value="10">JST(KST)</option>
          <option value="11">AEST/AEDT</option>
          <option value="12">NZST/NZDT</option>
          <option value="13">North Korea</option>
          <option value="14">IST (India)</option>
          <option value="15">CA-Saskatchewan</option>
          <option value="16">ACST</option>
          <option value="17">ACST/ACDT</option>
          <option value="18">HST (Hawaii)</option>
        </Select>
      </Desc>
      <Desc desc="UTC offset: ">
        <NumInput {...getProp('if.ntp.offset')} min="-65500" max="65500" required />
        seconds (max. 18 hours)
      </Desc>
      <div>
        Current local time is <span class="times">unknown</span>.
      </div>
      <div>
        Latitude (N):
        <NumInput {...getProp('if.ntp.lt')} class="mx-1" min="-66.6" max="66.6" step="0.01" />
        Longitude (E):
        <NumInput {...getProp('if.ntp.ln')} class="mx-1" min="-180" max="180" step="0.01" />
      </div>
      <div id="sun" class="times" />
      <h3>Clock</h3>
      <Desc desc="Clock Overlay: ">
        <Select {...getProp('ol.clock')}>
          <option value="0">None</option>
          <option value="1">Analog Clock</option>
          <option value="2">Single Digit Clock</option>
          <option value="3">Cronixie Clock</option>
        </Select>
      </Desc>
      {(settings.ol.clock === 2 || settings.ol.clock === 1) && (
        <div id="coc">
          <div>
            First LED: <NumInput {...getProp('ol.min')} min="0" max="255" required />
            Last LED: <NumInput {...getProp('ol.max')} min="0" max="255" required />
          </div>
          {settings.ol.clock === 1 && (
            <div id="cac">
              <Desc desc="12h LED: ">
                <NumInput {...getProp('ol.o12pix')} min="0" max="255" required />
              </Desc>
              <Desc desc="Show 5min marks: ">
                <CheckInput {...getProp('ol.o5m')} />
              </Desc>
            </div>
          )}
          <Desc desc="Seconds (as trail): ">
            <CheckInput {...getProp('ol.osec')} />
          </Desc>
        </div>
      )}
      {settings.ol.clock === 3 && (
        <div id="ccc">
          <Desc desc={'Cronixie Display: '}>
            <input name="CX" maxLength={6} />
          </Desc>
          <Desc desc="Cronixie Backlight: ">
            <input type="checkbox" name="CB" />
          </Desc>
        </div>
      )}
      <Desc desc="Countdown Mode: ">
        <CheckInput {...getProp('ol.cntdwn')} />
      </Desc>
      <div>Countdown Goal:</div>
      <div>
        Year: 20
        <NumInput {...getPropRaw('timers.cntdwn.goal.0')} min="0" max="99" required />
        Month: <NumInput {...getPropRaw('timers.cntdwn.goal.1')} min="1" max="12" required />
        Day:
        <NumInput {...getPropRaw('timers.cntdwn.goal.2')} min="1" max="31" required />
      </div>
      <div>
        Hour: <NumInput {...getPropRaw('timers.cntdwn.goal.3')} min="0" max="23" required />
        Minute:
        <NumInput {...getPropRaw('timers.cntdwn.goal.4')} min="0" max="59" required />
        Second:
        <NumInput {...getPropRaw('timers.cntdwn.goal.5')} min="0" max="59" required />
      </div>
      <h3>Macro presets</h3>
      <div>
        <b>Macros have moved!</b>
      </div>
      <div>
        <i>
          Presets now also can be used as macros to save both JSON and HTTP API commands.
          <br />
          Just enter the preset id below! Use 0 for the default action instead of a preset
        </i>
      </div>
      <Desc desc="Alexa On/Off Preset: ">
        <NumInput {...getPropRaw('if.va.macros.0')} min="0" max="250" required />
        <NumInput {...getPropRaw('if.va.macros.1')} min="0" max="250" required />
      </Desc>
      <Desc desc="Countdown-Over Preset: ">
        <NumInput {...getProp('timers.cntdwn.macro')} min="0" max="250" required />
      </Desc>
      <Desc desc="Timed-Light-Over Presets: ">
        <NumInput {...getProp('light.nl.macro')} type="number" min="0" max="250" required />
      </Desc>
      <h3>Button actions</h3>
      <table style="margin: 0 auto" id="macros">
        <thead>
          <tr>
            <td>
              push
              <br />
              switch
            </td>
            <td>
              short
              <br />
              on-&gt;off
            </td>
            <td>
              long
              <br />
              off-&gt;on
            </td>
            <td>
              double
              <br />
              N/A
            </td>
          </tr>
        </thead>
        <tbody>
          {settings.hw.btn.ins.map((_, i) => (
            <Button key={i} index={i} {...getProp(`hw.btn.ins.${i}`)} />
          ))}
        </tbody>
      </table>
      <a href={wikiUrl('Macros#analog-button')} target="_blank" rel="noreferrer">
        Analog Button setup
      </a>
      <h3>Time-controlled presets</h3>
      <div style="display: inline-block">
        <table id="TMT">
          <tr>
            <th>Active</th>
            <th>Hour</th>
            <th>Minute</th>
            <th>Preset</th>
            <th>M</th>
            <th>T</th>
            <th>W</th>
            <th>T</th>
            <th>F</th>
            <th>S</th>
            <th>S</th>
          </tr>
          {timers.map((t, i) => (
            <TimePreset
              key={i}
              index={i}
              pvalue={t}
              set={(v) => {
                setSetting('timers.ins', [...timers].fill(v, i, i));
              }}
            />
          ))}
        </table>
      </div>
      <hr />
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="submit">Save</button>
    </form>
  );
}

type TPreset = Settings['timers']['ins'][0];

function TimePreset(props: { index: number } & Prop<TPreset>): JSX.Element {
  const i = props.index;

  const newSet = (toCall: (v: TPreset) => TPreset): void => {
    props.set(toCall(props.pvalue));
  };
  const getProp = bindGetPathProp(props.pvalue, newSet);

  return (
    <tr>
      <td>
        <CheckInput {...getProp('en')} />
      </td>
      <td>{i > 7 ? <div>Sunrise</div> : <NumInput min="0" max="24" {...getProp('hour')} />}</td>
      <td>
        <NumInput min="0" max="59" {...getProp('min')} />
      </td>
      <td>
        <NumInput min="0" max="250" {...getProp('macro')} />
      </td>
      {[...range(0, 7)].map((j) => (
        <td key={j}>
          <ConvertCheckInput
            {...getProp('dow')}
            to={(v) => (v & (1 << j)) !== 0}
            from={(v, p) => (p & ~(1 << j)) | ((v ? 1 : 0) << j)}
          />
        </td>
      ))}
    </tr>
  );
}

type TBTNMacro = Settings['hw']['btn']['ins'][0];

function Button({
  index,
  pvalue,
  set,
}: { index: number } & Prop<TBTNMacro | undefined>): JSX.Element {
  if (!pvalue) {
    return <div />;
  }
  const v = pvalue.macros ?? [0, 0, 0];
  const setPin = (i: number, val: number) => {
    const macros = [...v];
    macros[i] = val;
    set({ ...pvalue, macros });
  };
  return (
    <tr>
      <td>Button {index}: </td>
      <td>
        <NumInput min="0" max="250" pvalue={v[0]} set={(n: number) => setPin(0, n)} required />
      </td>
      <td>
        <NumInput min="0" max="250" pvalue={v[1]} set={(n: number) => setPin(1, n)} required />
      </td>
      <td>
        <NumInput min="0" max="250" pvalue={v[2]} set={(n: number) => setPin(2, n)} required />
      </td>
    </tr>
  );
}

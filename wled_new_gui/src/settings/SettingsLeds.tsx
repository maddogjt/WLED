import { JSX } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { useSelector2 } from 'predux/preact';
import { selectSettings, Settings } from '../features/settings';
import { selectInfo } from '../features/wledState';
import { useStateFromProps } from '../welcome/useStateFromProps';
import { CheckInput, Desc, NumInput, Select, wikiUrl } from './Controls';
import { getPathProp, bindGetPathProp, Prop, bindGetPathPropRaw } from './pathProps';
import { Path, PathType, typedDotProp } from './Accessors';
import { range } from './utils';

interface LEDInfo {
  id: number;
  name: string;
  isRGBW?: boolean;
  config: 'Data' | 'ClkData' | 'Pins';
  pins: number;
}

enum Voltage {
  V5V55MA = 55,
  V5V35MA = 35,
  V12V30MA = 30,
  WS281512MA = 255,
  CUSTOM = 50,
}

type TBTN = Settings['hw']['btn']['ins'][0];

const ledTypes: LEDInfo[] = [
  { id: 22, name: 'WS281x', config: 'Data', pins: 1 },
  { id: 30, name: 'SK6812 RGBW', config: 'Data', isRGBW: true, pins: 1 },
  { id: 31, name: 'TM1814', config: 'Data', isRGBW: true, pins: 1 },
  { id: 24, name: '400kHz', config: 'Data', pins: 1 },
  { id: 50, name: 'WS2801', config: 'ClkData', pins: 2 },
  { id: 51, name: 'APA102', config: 'ClkData', pins: 2 },
  { id: 52, name: 'LPD8806', config: 'ClkData', pins: 2 },
  { id: 53, name: 'P9813', config: 'ClkData', pins: 2 },
  { id: 41, name: 'PWM White', config: 'Pins', isRGBW: true, pins: 1 },
  { id: 42, name: 'PWM WWCW', config: 'Pins', isRGBW: true, pins: 2 },
  { id: 43, name: 'PWM RGB', config: 'Pins', pins: 3 },
  { id: 44, name: 'PWM RGBW', config: 'Pins', pins: 4, isRGBW: true },
  { id: 45, name: 'PWM RGBWC', config: 'Pins', pins: 5, isRGBW: true },
];

const ledTypesById = ledTypes.reduce<Record<number, LEDInfo>>((p, n) => {
  p[n.id] = n;
  return p;
}, {});

const maxB = 10;
const maxM = 64000;
const maxPB = 4096;

function LEDButton(
  props: {
    index: number;
    checkPin: (p: number) => boolean;
  } & Prop<TBTN | undefined> &
    JSX.IntrinsicAttributes
): JSX.Element {
  const { index, pvalue, set, checkPin } = props;
  if (pvalue === undefined) {
    return <div />;
  }

  const setPin = (v: number) => set({ ...pvalue, pin: [v] });
  const newSet = (toCall: (v: TBTN) => TBTN): void => {
    props.set(toCall(pvalue));
  };
  return (
    <Desc desc={`Button ${index} pin:`}>
      <NumInput
        min={-1}
        max={40}
        pvalue={pvalue.pin[0]}
        set={setPin}
        style={{ color: checkPin(pvalue.pin[0]) ? '#fff' : '#f00', width: '35px' }}
      />
      &nbsp;
      <Select {...getPathProp(pvalue, newSet, 'type')}>
        <option value="0">Disabled</option>
        <option value="2">Pushbutton</option>
        <option value="3">Push inverted</option>
        <option value="4">Switch</option>
        <option value="5">Switch inverted</option>
        <option value="6">Touch</option>
        <option value="7">Analog</option>
      </Select>
      <span style="cursor: pointer;" class="mx-1" onClick={() => setPin(-1)}>
        &#215;
      </span>
    </Desc>
  );
}

function getMem(type: number, len: number, p0: number) {
  if (type < 32) {
    if (maxM < 10000 && p0 == 3) {
      //8266 DMA uses 5x the mem
      if (type > 29) return len * 20; //RGBW
      return len * 15;
    } else if (maxM >= 10000) {
      //ESP32 RMT uses double buffer?
      if (type > 29) return len * 8; //RGBW
      return len * 6;
    }
    if (type > 29) return len * 4; //RGBW
    return len * 3;
  }
  if (type > 31 && type < 48) return 5;
  if (type == 44 || type == 45) return len * 4; //RGBW
  return len * 3;
}

// Flash memory reserved pins.
// TODO - this should come system, see 'um_p' setting code
const reservedPins = [6, 7, 8, 9, 10, 11];

function getPins(settings: Settings): number[] {
  const { hw } = settings;
  const pins: number[] = [...reservedPins];
  pins.push(hw.relay.pin);
  hw.btn.ins.forEach((b) => pins.push(...b.pin));
  pins.push(hw.ir.pin);
  hw.led.ins.forEach((i) => pins.push(...i.pin));
  return pins;
}

type LedInstance = Settings['hw']['led']['ins'][0];

function LEDOutput(
  props: {
    id: number;
  } & Prop<LedInstance | undefined>
): JSX.Element {
  const { pvalue, id } = props;
  if (pvalue === undefined) {
    return <div />;
  }

  const ledType = ledTypesById[pvalue.type];

  const set = (toCall: (v: LedInstance) => LedInstance): void => {
    props.set(toCall(pvalue));
  };

  const getProp = bindGetPathProp(pvalue, set);
  const getPropRaw = bindGetPathPropRaw(pvalue, set);

  return (
    <div class="iST">
      {id > 0 && <hr />}
      <Desc desc={`${id + 1}: `}>
        <Select {...getProp('type')}>
          {ledTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
        &nbsp;Color Order:&nbsp;
        <Select {...getProp('order')}>
          <option value="0">GRB</option>
          <option value="1">RGB</option>
          <option value="2">BRG</option>
          <option value="3">RBG</option>
          <option value="4">BGR</option>
          <option value="5">GBR</option>
        </Select>
      </Desc>
      <Desc desc={ledType.config === 'ClkData' ? 'Data: ' : ledType.pins > 1 ? 'Pins: ' : 'Pin: '}>
        <NumInput
          type="number"
          class="m-1"
          min="0"
          max="40"
          {...getPropRaw('pin.0')}
          required
          style="width:35px"
        />
        {ledType.config === 'ClkData' && <span>Clock:</span>}
        {[...range(1, ledType.pins ?? 1)].map((v: number) => {
          return (
            <NumInput
              key={v}
              class="m-1"
              min="0"
              max="40"
              style="width:35px"
              {...getPropRaw(`pin.${v}`)}
            />
          );
        })}
      </Desc>
      <Desc desc={ledType.config === 'Pins' ? 'Index: ' : 'Start: '}>
        <NumInput min="0" max="8191" {...getProp('start')} required />
        {ledType.config !== 'Pins' && (
          <Desc desc=" Count: " class="d-inline">
            <NumInput min="0" max={maxPB} {...getProp('len')} required />
          </Desc>
        )}
      </Desc>
      {ledType.config !== 'Pins' && (
        <Desc desc="Reverse (rotated 180°): ">
          <CheckInput {...getProp('rev')} />
          &nbsp;Skip 1<sup>st</sup> LED:
          <CheckInput {...getProp('skip')} />
        </Desc>
      )}
    </div>
  );
}

export function SettingsLeds(): JSX.Element {
  const [settings, setSettings] = useStateFromProps(useSelector2(selectSettings));
  const pwr = useSelector2(selectInfo, (i) => i?.leds.pwr ?? 0);
  const [lasel, setLasel] = useState(
    [30, 35, 55, 255].indexOf(settings.hw.led.ledma) !== -1 ? settings.hw.led.ledma : 50
  );
  const [aben, setAben] = useState(settings.hw.led.ledma !== 0);

  const pins = useMemo(() => getPins(settings), [settings]);

  const checkPin = (p: number): boolean => {
    if (p === -1) {
      return true;
    }
    const first = pins.indexOf(p);
    if (first !== -1) return pins.indexOf(p, first + 1) === -1;
    return true;
  };

  const isRGBW = useMemo(
    () =>
      settings.hw.led.ins.reduce<boolean>(
        (p, n) => p || (ledTypesById[n.type].isRGBW ?? false),
        false
      ),
    [settings.hw.led.ins]
  );

  const getProp = bindGetPathProp<Settings>(settings, setSettings);

  // function enABL() {
  //   var e = gId('able').checked;
  //   (d.Sf.LA.value = e ? laprev : 0),
  //     (gId('abl').style.display = e ? 'inline' : 'none'),
  //     (gId('psu2').style.display = e ? 'inline' : 'none'),
  //     d.Sf.LA.value > 0 && setABL();
  // }

  const [ledCount, ledMemory] = useMemo(
    () =>
      settings.hw.led.ins.reduce<[number, number]>(
        (p, n) => [p[0] + n.len, p[1] + getMem(n.type, n.len, n.pin[0])],
        [0, 0]
      ),
    [settings.hw.led]
  );
  const memPct = (ledMemory / maxM) * 100;
  const maxStripLen = settings.hw.led.ins.reduce<number>((p, v) => Math.max(p, v.len), 0);

  const maPerLed = settings.hw.led.ledma === Voltage.WS281512MA ? 12 : settings.hw.led.ledma;
  const baseMa = 100;
  const [psu, psu2] = useMemo(() => {
    // estimate current & round up to half amp
    let f = Math.ceil((baseMa + ledCount * maPerLed) / 500) / 2;

    // If current is greater than 5a, round up to nearest amp
    f = f > 5 ? Math.ceil(f) : f;
    let a = 'ESP 5V pin with 1A USB supply';

    const is12V = Voltage.V12V30MA == lasel; //d.Sf.LAsel.value,
    const isWS2815 = Voltage.WS281512MA == lasel; //d.Sf.LAsel.value;
    if (f >= 1.02 || is12V || isWS2815) {
      a = `${is12V ? '12V ' : isWS2815 ? 'WS2815 12V ' : '5V '}${f}A supply connected to LEDs`;
    }

    const lowC = Math.ceil((baseMa + ledCount * maPerLed) / 1500) / 2;
    let h = `(for most effects, ~${lowC > 5 ? Math.ceil(lowC) : lowC}A is enough)`;
    h = isWS2815 ? '' : h;

    return [a, h];
  }, [lasel, ledCount, maPerLed]);

  const setSetting = <P extends string>(
    path: Path<Settings, P>,
    value: PathType<Settings, P> | ((v: PathType<Settings, P>) => PathType<Settings, P>)
  ): void => {
    setSettings((s) => typedDotProp.set<Settings, P>(s, path, value));
  };

  function addLEDs(): void {
    const bus: LedInstance = {
      pin: [-1, -1, -1, -1, -1],
      start: settings.hw.led.ins.reduce<number>((p, n) => Math.max(p, n.start + n.len), 0),
      len: 1,
      type: 22,
      order: 0,
      rev: false,
      skip: 0,
    };
    setSetting('hw.led.ins', (list) => [...list, bus]);
  }

  function removeLEDs(): void {
    setSetting('hw.led.ins', (list) => list.slice(0, list.length - 1));
  }

  return (
    <form method="post" class="settings">
      <div class="helpB">
        <a href={wikiUrl('Settings#led-settings')} target="_blank" rel="noreferrer">
          <button type="button">?</button>
        </a>
      </div>
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="submit">Save</button>
      <hr />
      <h2>LED &amp; Hardware setup</h2>
      <Desc desc="Total LED count: ">
        <NumInput {...getProp('hw.led.total')} min="1" max="8192" required />
      </Desc>
      <div>
        <i>Recommended power supply for brightest white:</i>
      </div>
      <div>
        <b>{psu}</b>
      </div>
      <div>{psu2}</div>
      <Desc desc="Enable automatic brightness limiter: ">
        <CheckInput
          pvalue={aben}
          set={(v: boolean) => {
            setAben(v);
            if (!v) setSetting('hw.led.ledma', 0);
          }}
        />
      </Desc>
      {aben && (
        <div>
          <Desc desc="Maximum Current: ">
            <NumInput {...getProp('hw.led.maxpwr')} min="250" max="65000" required /> mA
          </Desc>
          {settings.hw.led.maxpwr > 7200 && (
            <div style="color: orange;">
              &#9888; Your power supply provides high current.
              <br />
              To improve the safety of your setup,
              <br />
              please use thick cables,
              <br />
              multiple power injection points and a fuse!
              <br />
            </div>
          )}
          <div>
            <i>
              Automatically limits brightness to stay close to the limit.
              <br />
              Keep at &lt;1A if powering LEDs directly from the ESP 5V pin!
              <br />
              If you are using an external power supply, enter its rating.
              <br />
              (Current estimated usage: {pwr} mA)
            </i>
          </div>
          <div>LED voltage (Max. current for a single LED):</div>
          <div>
            <Select
              pvalue={lasel}
              set={(v: number) => {
                setLasel(v);
                setSetting('hw.led.ledma', v);
              }}
            >
              <option value="55">5V default (55mA)</option>
              <option value="35">5V efficient (35mA)</option>
              <option value="30">12V (30mA)</option>
              <option value="255">WS2815 (12mA)</option>
              <option value="50" selected>
                Custom
              </option>
            </Select>
          </div>
          {lasel === 50 && (
            <Desc desc="Custom max. current per LED: ">
              <NumInput {...getProp('hw.led.ledma')} min="0" max="255" required /> mA
            </Desc>
          )}
          <div>
            <i>Keep at default if you are unsure about your type of LEDs.</i>
          </div>
        </div>
      )}
      <h3>Hardware setup</h3>
      <div>LED outputs:</div>
      {settings.hw.led.ins.map((b, i) => (
        <LEDOutput key={i} id={i} {...getProp(`hw.led.ins.${i}`)} />
      ))}
      <div>
        {settings.hw.led.ins.length < maxB && (
          <button type="button" onClick={addLEDs} class="btn btn-sm sz-48">
            +
          </button>
        )}
        {settings.hw.led.ins.length > 1 && (
          <button type="button" onClick={removeLEDs} class="btn btn-sm sz-48">
            -
          </button>
        )}
      </div>
      <Desc desc="LED Memory Usage: ">
        {ledMemory} / {maxM} B
      </Desc>
      <div
        style={{
          display: 'inline-block',
          width: '100px',
          height: '10px',
          borderRadius: '20px',
          background: `linear-gradient(90deg, ${
            memPct > 60 ? (memPct > 90 ? 'red' : 'orange') : '#ccc'
          } 0 ${memPct}%, #444 ${memPct}% 100%)`,
        }}
      />
      {(maxStripLen > 800 || memPct > 80) && (
        <div style={{ color: maxStripLen > maxPB || memPct > 100 ? 'red' : 'orange' }}>
          &#9888; You might run into stability or lag issues.
          <br />
          Use less than {memPct > 80 ? '80% of max. LED memory' : '800 LEDs per pin'}
          {memPct > 100 && <b> (WARNING: Using over {maxM}B!)</b>} for the best experience!
        </div>
      )}
      <hr />
      {settings.hw.btn.ins.map((_e, i: number) => {
        return <LEDButton key={i} index={i} checkPin={checkPin} {...getProp(`hw.btn.ins.${i}`)} />;
      })}
      <Desc desc="Touch threshold: ">
        <NumInput min="0" max="100" {...getProp('hw.btn.tt')} required />
      </Desc>
      <Desc desc="IR pin: ">
        <NumInput min="-1" max="40" style="width:35px" {...getProp('hw.ir.pin')} />
        <Select {...getProp('hw.ir.type')} class="mx-1">
          <option value="0">Remote disabled</option>
          <option value="1">24-key RGB</option>
          <option value="2">24-key with CT</option>
          <option value="3">40-key blue</option>
          <option value="4">44-key RGB</option>
          <option value="5">21-key RGB</option>
          <option value="6">6-key black</option>
          <option value="7">9-key red</option>
        </Select>
        <span style="cursor: pointer;" class="mx-1" onClick={() => setSetting('hw.ir.pin', -1)}>
          &#215;
        </span>
      </Desc>
      <div>
        <a href={wikiUrl('Infrared-Control')} target="_blank" rel="noreferrer">
          IR info
        </a>
      </div>
      <Desc desc="Relay pin: ">
        <NumInput
          min="-1"
          max="40"
          {...getProp('hw.relay.pin')}
          style={{ color: checkPin(settings.hw.relay.pin) ? '#fff' : '#f00', width: '35px' }}
        />
        <Desc desc=" Invert " class="d-inline">
          <CheckInput {...getProp('hw.relay.rev')} />
        </Desc>
        <span style="cursor: pointer;" class="mx-1" onClick={() => setSetting('hw.relay.pin', -1)}>
          &#215;
        </span>
      </Desc>
      <hr />
      <h3>Defaults</h3>
      <Desc desc="Turn LEDs on after power up/reset: ">
        <CheckInput {...getProp('def.on')} />
      </Desc>
      <Desc desc="Default brightness: ">
        <NumInput {...getProp('def.bri')} min="0" max="255" required /> (0-255)
      </Desc>
      <Desc desc="Apply preset ">
        <NumInput {...getProp('def.ps')} min="0" max="250" required /> at boot (0 uses defaults)
      </Desc>
      <div>
        - <i>or</i> -
      </div>
      <Desc desc="Set current preset cycle setting as boot default: ">
        {/* JATRA - TODO - seems this is unused on backend?? */}
        <input type="checkbox" name="PC" />
      </Desc>
      <br />
      <Desc desc="Use Gamma correction for color: ">
        <CheckInput
          pvalue={settings.light.gc.col > 1.5}
          set={(v: boolean) => setSetting('light.gc.col', v ? 2.8 : 1.0)}
        />{' '}
        (strongly recommended)
      </Desc>
      <Desc desc="Use Gamma correction for brightness: ">
        <CheckInput
          pvalue={settings.light.gc.bri > 1.5}
          set={(v: boolean) => setSetting('light.gc.bri', v ? 2.8 : 1.0)}
        />{' '}
        (not recommended)
      </Desc>
      <br />
      <Desc desc="Brightness factor: ">
        <NumInput {...getProp('light.scale-bri')} min="1" max="255" required /> %
      </Desc>
      <h3>Transitions</h3>
      <Desc desc="Crossfade: ">
        <CheckInput {...getProp('light.tr.mode')} />
      </Desc>
      <Desc desc="Transition Time: ">
        <NumInput {...getProp('light.tr.dur')} maxLength={5} size={2} /> ms
      </Desc>
      <Desc desc="Enable Palette transitions: ">
        <CheckInput {...getProp('light.tr.pal')} />
      </Desc>
      <h3>Timed light</h3>
      <Desc desc="Default Duration: ">
        <NumInput {...getProp('light.nl.dur')} min="1" max="255" required /> min
      </Desc>
      <Desc desc="Default Target brightness: ">
        <NumInput {...getProp('light.nl.tbri')} min="0" max="255" required />
      </Desc>
      <Desc desc="Mode: ">
        <Select {...getProp('light.nl.mode')}>
          <option value={0}>Wait and set</option>
          <option value={1}>Fade</option>
          <option value={2}>Fade Color</option>
          <option value={3}>Sunrise</option>
        </Select>
      </Desc>
      <h3>Advanced</h3>
      <Desc desc="Palette blending: ">
        <Select {...getProp('light.pal-mode')}>
          <option value={0}>Linear (wrap if moving)</option>
          <option value={1}>Linear (always wrap)</option>
          <option value={2}>Linear (never wrap)</option>
          <option value={3}>None (not recommended)</option>
        </Select>
      </Desc>
      {isRGBW && (
        <Desc desc="Auto-calculate white channel from RGB: ">
          <Select {...getProp('hw.led.rgbwm')}>
            <option value={0}>None</option>
            <option value={1}>Brighter</option>
            <option value={2}>Accurate</option>
            <option value={3}>Dual</option>
            <option value={4}>Legacy</option>
          </Select>
        </Desc>
      )}
      <hr />
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="submit">Save</button>
    </form>
  );
}

import { JSX } from 'preact';
import { useCallback, useEffect, useState, useMemo } from 'preact/hooks';
import { useSelector } from 'predux/preact';
import { selectSettings, Settings } from '../features/settings';
import { useStateFromProps } from '../welcome/useStateFromProps';
import { CheckInput, Desc, IpAddress, NumInput, Select, TextInput, wikiUrl } from './Controls';
import { bindSetter } from './Accessors';
import { bindGetPathProp } from './pathProps';

export function SettingsSync(): JSX.Element {
  const [settings, setSettings] = useStateFromProps(useSelector(selectSettings));
  const [DI, setDI] = useState(0);

  useEffect(() => {
    switch (settings.if.live.port) {
      case 5568:
        setDI(5568);
        break;
      case 6454:
        setDI(6454);
        break;
      case 4048:
        setDI(4048);
        break;
    }
    // Explicity disabling deps so this is a one-shot call
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProp = bindGetPathProp<Settings>(settings, setSettings);

  const setSetting = useMemo(() => bindSetter(setSettings), [setSettings]);

  const adj = useCallback(
    (di: number) => {
      let addr = settings.if.live.dmx.addr;
      let uni = settings.if.live.dmx.uni;
      if (di == 6454) {
        addr = addr == 1 ? 0 : addr;
        uni = uni == 1 ? 0 : uni;
      } else if (di == 5568) {
        addr = addr == 0 ? 1 : addr;
        uni = uni == 0 ? 1 : uni;
      } else {
        return;
      }
      setSetting('if.live.dmx.addr', addr);
      setSetting('if.live.dmx.uni', uni);
    },
    [settings.if.live.dmx.addr, settings.if.live.dmx.uni, setSetting]
  );

  return (
    <form method="post" class="settings">
      <div class="helpB">
        <a href={wikiUrl('Settings#sync-settings')} target="_blank" rel="noreferrer">
          <button type="button">?</button>
        </a>
      </div>
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="submit">Save</button>
      <hr />
      <h2>Sync setup</h2>
      <h3>WLED Broadcast</h3>
      <Desc desc="UDP Port:">
        <NumInput {...getProp('if.sync.port0')} />
      </Desc>
      <Desc desc="2nd Port:">
        <NumInput {...getProp('if.sync.port1')} />
      </Desc>
      <Desc desc="Receive: ">
        <CheckInput {...getProp('if.sync.recv.bri')} /> Brightness,&nbsp;
        <CheckInput {...getProp('if.sync.recv.col')} /> Color, and&nbsp;
        <CheckInput {...getProp('if.sync.recv.fx')} /> Effects
      </Desc>
      <Desc desc="Send notifications on direct change: ">
        <CheckInput {...getProp('if.sync.send.dir')} />
      </Desc>
      <Desc desc="Send notifications on button press or IR: ">
        <CheckInput {...getProp('if.sync.send.btn')} />
      </Desc>
      <Desc desc="Send Alexa notifications: ">
        <CheckInput {...getProp('if.sync.send.va')} />
      </Desc>
      <Desc desc="Send Philips Hue change notifications: ">
        <CheckInput {...getProp('if.sync.send.hue')} />
      </Desc>
      <Desc desc="Send Macro notifications: ">
        <CheckInput {...getProp('if.sync.send.macro')} />
      </Desc>
      <Desc desc="Send notifications twice:">
        <CheckInput {...getProp('if.sync.send.twice')} />
      </Desc>
      <i>Reboot required to apply changes. </i>
      <h3 class="my-4">Instance List</h3>
      <Desc desc="Enable instance list: ">
        <CheckInput {...getProp('if.nodes.list')} />
      </Desc>
      <Desc desc="Make this instance discoverable: ">
        <CheckInput {...getProp('if.nodes.bcast')} />
      </Desc>
      <h3 class="my-4">Realtime</h3>
      <Desc desc="Receive UDP realtime: ">
        <CheckInput {...getProp('if.live.en')} />
      </Desc>
      <br />
      <i>Network DMX input</i>
      <br />
      <Desc desc="Type: ">
        <Select
          value={DI}
          set={(v: number) => {
            setDI(v);
            adj(v);
          }}
        >
          <option value={5568}>E1.31 (sACN)</option>
          <option value={6454}>Art - Net</option>
          <option value={4048}>DDP</option>
          <option value={0}>Custom port</option>
        </Select>
      </Desc>
      {DI == 0 && (
        <Desc desc="Port: ">
          <NumInput {...getProp('if.live.port')} min="1" max="65535" class="d5" required />
        </Desc>
      )}
      <Desc desc="Multicast: ">
        <CheckInput {...getProp('if.live.mc')} />
      </Desc>
      <Desc desc="Start universe: ">
        <NumInput min="0" max="63999" required {...getProp('if.live.dmx.uni')} />
      </Desc>
      <div>
        <i>Reboot required.</i> Check out{' '}
        <a href="https://github.com/LedFx/LedFx" target="_blank" rel="noreferrer">
          LedFx
        </a>
        !
      </div>
      <Desc desc="Skip out-of-sequence packets: ">
        <CheckInput {...getProp('if.live.dmx.seqskip')} />
      </Desc>
      <Desc desc="DMX start address: ">
        <NumInput {...getProp('if.live.dmx.addr')} min="0" max="510" required />
      </Desc>
      <Desc desc="DMX mode: ">
        <Select {...getProp('if.live.dmx.mode')}>
          <option value={0}>Disabled</option>
          <option value={1}>Single RGB</option>
          <option value={2}>Single DRGB</option>
          <option value={3}>Effect</option>
          <option value={4}>Multi RGB</option>
          <option value={5}>Dimmer + Multi RGB</option>
          <option value={6}>Multi RGBW</option>
        </Select>
      </Desc>
      <a href={wikiUrl('E1.31-DMX')} target="_blank" rel="noreferrer">
        E1.31 info
      </a>
      <Desc desc="Timeout: ">
        <NumInput {...getProp('if.live.timeout')} min="1" max="65000" required /> ms
      </Desc>
      <Desc desc="Force max brightness: ">
        <CheckInput {...getProp('if.live.maxbri')} />
      </Desc>
      <Desc desc="Disable realtime gamma correction: ">
        <CheckInput {...getProp('if.live.no-gc')} />
      </Desc>
      <Desc desc="Realtime LED offset: ">
        <NumInput {...getProp('if.live.offset')} min="-255" max="255" required />
      </Desc>
      <h3 class="my-4">Alexa Voice Assistant</h3>
      <Desc desc="Emulate Alexa device: ">
        <CheckInput {...getProp('if.va.alexa')} />
      </Desc>
      <Desc desc="Alexa invocation name: ">
        <TextInput {...getProp('id.inv')} maxLength={32} />
      </Desc>
      <h3 class="my-4">Blynk</h3>
      <b>
        Blynk, MQTT and Hue sync all connect to external hosts!
        <br />
        This may impact the responsiveness of the ESP8266.
      </b>
      <br />
      For best results, only use one of these services at a time.
      <br />
      (alternatively, connect a second ESP to them and use the UDP sync)
      <br />
      <br />
      <Desc desc="Host: ">
        <TextInput {...getProp('if.blynk.host')} maxLength={32} />
        <Desc desc=" Port: " class="d-inline">
          <NumInput {...getProp('if.blynk.port')} />
        </Desc>
      </Desc>
      <Desc desc="Device Auth token: ">
        <TextInput {...getProp('if.blynk.token')} maxLength={33} />
      </Desc>
      <i>Clear the token field to disable. </i>
      <a href={wikiUrl('Blynk')} target="_blank" rel="noreferrer">
        Setup info
      </a>
      <h3 class="my-4">MQTT</h3>
      <Desc desc="Enable MQTT: ">
        <CheckInput {...getProp('if.mqtt.en')} />
      </Desc>
      <Desc desc="Broker: ">
        <TextInput {...getProp('if.mqtt.broker')} maxLength={32} />
        <Desc desc=" Port: " class="d-inline">
          <NumInput {...getProp('if.mqtt.port')} />
        </Desc>
      </Desc>
      <b>
        The MQTT credentials are sent over an unsecured connection.
        <br />
        Never use the MQTT password for another service!
      </b>
      <Desc desc="Username: ">
        <TextInput {...getProp('if.mqtt.user')} maxLength={40} />
      </Desc>
      <Desc desc="Password: ">
        <TextInput
          type="password"
          {...getProp('if.mqtt.psk')}
          placeholder={'•'.repeat(settings.if.mqtt.pskl)}
          autoComplete="off"
          maxLength={64}
        />
      </Desc>
      <Desc desc="Client ID: ">
        <TextInput {...getProp('if.mqtt.cid')} maxLength={40} />
      </Desc>
      <Desc desc="Device Topic: ">
        <TextInput {...getProp('if.mqtt.topics.device')} maxLength={32} />
      </Desc>
      <Desc desc="Group Topic: ">
        <TextInput {...getProp('if.mqtt.topics.group')} maxLength={32} />
      </Desc>
      <Desc desc="Publish on button press: ">
        <CheckInput {...getProp('hw.btn.mqtt')} />
      </Desc>
      <i>Reboot required to apply changes. </i>
      <a href={wikiUrl('MQTT')} target="_blank" rel="noreferrer">
        MQTT info
      </a>
      <h3 class="my-4">Philips Hue</h3>
      <div>
        <i>
          You can find the bridge IP and the light number in the 'About' section of the hue app.
        </i>
      </div>
      <Desc desc="Poll Hue light ">
        <NumInput {...getProp('if.hue.id')} min="1" max="99" /> every{' '}
        <NumInput {...getProp('if.hue.iv')} min="100" max="65000" /> ms:{' '}
        <CheckInput {...getProp('if.hue.en')} />
      </Desc>
      <Desc desc="Then, receive ">
        <CheckInput {...getProp('if.hue.recv.on')} /> On/Off,{' '}
        <CheckInput {...getProp('if.hue.recv.bri')} /> Brightness, and{' '}
        <CheckInput {...getProp('if.hue.recv.col')} /> Color
      </Desc>
      <div>Hue Bridge IP:</div>
      <IpAddress {...getProp('if.hue.ip')} />
      <div>
        <b>Press the pushlink button on the bridge, after that save this page!</b>
        <br />
        (when first connecting)
      </div>
      <div>Hue status: Disabled in this build</div>
      <hr />
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="submit">Save</button>
    </form>
  );
}

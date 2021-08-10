import { JSX } from 'preact';
import { useSelector } from 'predux/preact';
import { selectSettings } from '../features/settings';
import { selectInfo } from '../features/wledState';
import { useStateFromProps } from '../welcome/useStateFromProps';
import {
  CheckInput,
  ConvertCheckInput,
  convertInvert,
  Desc,
  IpAddress,
  NumInput,
  Select,
  TextInput,
  wikiUrl,
} from './Controls';
import { bindGetPathProp } from './pathProps';

export function SettingsWifi(): JSX.Element {
  const info = useSelector(selectInfo);

  const [settings, setSettings] = useStateFromProps(useSelector(selectSettings));
  const getProp = bindGetPathProp(settings, setSettings);

  return (
    <form method="post" class="settings">
      <div class="helpB">
        <a href={wikiUrl('Settings#user-interface-settings')} target="_blank" rel="noreferrer">
          <button type="button">?</button>
        </a>
      </div>
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="submit">Save & Connect</button>
      <hr />
      <h2>WiFi setup</h2>
      <h3>Connect to existing network</h3>
      <div>Network name (SSID, empty to not connect):</div>
      <TextInput name="CS" maxLength={32} {...getProp('nw.ins.0.ssid')} />
      <div>Network password:</div>
      <div>
        <TextInput
          type="password"
          name="CP"
          maxLength={63}
          placeholder={'•'.repeat(settings.nw.ins[0].pskl)}
          {...getProp('nw.ins.0.psk')}
        />
      </div>
      <div>Static IP (leave at 0.0.0.0 for DHCP):</div>
      <IpAddress {...getProp('nw.ins.0.ip')} />
      <div>Static gateway:</div>
      <IpAddress {...getProp('nw.ins.0.gw')} />
      <div>Static subnet mask:</div>
      <IpAddress {...getProp('nw.ins.0.sn')} />
      <div>mDNS address (leave empty for no mDNS):</div>
      <div>
        {'http:// '}
        <TextInput maxLength={32} {...getProp('id.mdns')} />
        {' .local'}
      </div>
      <div>Client IP: {info.ip ?? 'Not connected'}</div>
      <h3>Configure Access Point</h3>
      <div>AP SSID (leave empty for no AP):</div>
      <TextInput maxLength={32} {...getProp('ap.ssid')} />
      <Desc desc="Hide AP name: ">
        <CheckInput {...getProp('ap.hide')} />
      </Desc>
      <div>AP password (leave empty for open):</div>
      <TextInput
        type="password"
        maxLength={63}
        pattern="(.{8,63})|()"
        title="Empty or min. 8 characters"
        required
        placeholder={'•'.repeat(settings.ap.pskl)}
        {...getProp('ap.psk')}
      />
      <Desc desc="Access Point WiFi channel: ">
        <NumInput min="1" max="13" required class="xs" {...getProp('ap.chan')} />
      </Desc>
      <Desc desc="AP opens: ">
        <Select {...getProp('ap.behav')}>
          <option value="0">No connection after boot</option>
          <option value="1">Disconnected</option>
          <option value="2">Always</option>
          <option value="3">Never (not recommended)</option>
        </Select>
      </Desc>
      <div>AP IP: {settings.ap.ip.join('.') ?? 'Not Active'}</div>
      <h3>Experimental</h3>
      <Desc desc="Disable WiFi sleep: ">
        <ConvertCheckInput {...getProp('wifi.sleep')} {...convertInvert} />
      </Desc>
      <i>
        Can help with connectivity issues.
        <br />
        Do not enable if WiFi is working correctly, increases power consumption.
      </i>
      {settings.eth && (
        <div>
          <h3>Ethernet Type</h3>
          <Select {...getProp('eth.type')}>
            <option value="0">None</option>
            <option value="2">ESP32-POE</option>
            <option value="4">QuinLED-ESP32</option>
            <option value="3">WESP32</option>
            <option value="1">WT32-ETH01</option>
          </Select>
        </div>
      )}
      <hr />
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="submit">Save & Connect</button>
    </form>
  );
}

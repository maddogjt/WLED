import { selectSettings } from '../features/settings';
import { JSX } from 'preact';
import { useSelector } from 'predux/preact';
import { useStateFromProps } from '../welcome/useStateFromProps';
import { bindGetPathProp } from './pathProps';
import { CheckInput, Desc, TextInput, wikiUrl, wledUrl } from './Controls';
import { selectInfo } from '../features/wledState';

export function SettingsSec(): JSX.Element {
  const info = useSelector(selectInfo);
  const [settings, setSettings] = useStateFromProps(useSelector(selectSettings));
  const getProp = bindGetPathProp(settings, setSettings);

  return (
    <form method="post" class="settings">
      <div class="helpB">
        <a href={wikiUrl(`Settings#security-settings`)} target="_blank" rel="noreferrer">
          <button type="button">?</button>
        </a>
      </div>
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="submit">Save & Reboot</button>
      <hr />
      <h2>Security & Update setup</h2>
      <Desc desc="Lock wireless (OTA) software update: ">
        <CheckInput {...getProp('ota.lock')} />
      </Desc>
      <Desc desc="Passphrase: ">
        <TextInput
          type="password"
          maxLength={32}
          placeholder={'•'.repeat(settings.ota.pskl)}
          {...getProp('ota.psk')}
        />
      </Desc>
      <div>
        To enable OTA, for security reasons you need to also enter the correct password!
        <br />
        The password should be changed when OTA is enabled.
        <br />
        <b>Disable OTA when not in use, otherwise an attacker can reflash device software!</b>
        <br />
        <i>Settings on this page are only changable if OTA lock is disabled!</i>
      </div>
      <Desc desc="Deny access to WiFi settings if locked: ">
        <CheckInput {...getProp('ota.lock-wifi')} />
      </Desc>
      <br />
      <Desc desc="Factory reset: ">
        <input type="checkbox" name="RS" />
      </Desc>
      <div>All settings and presets will be erased.</div>
      <br />
      <div>
        HTTP traffic is unencrypted. An attacker in the same network can intercept form data!
      </div>
      <h3>Software Update</h3>
      <a href="/update">
        <button type="button">Manual OTA Update</button>
      </a>
      <br />
      <Desc desc="Enable ArduinoOTA: ">
        <CheckInput {...getProp('ota.aota')} />
      </Desc>
      <h3>About</h3>
      <div>
        <a href={wledUrl('')} target="_blank" rel="noreferrer">
          WLED
        </a>{' '}
        version {info.ver}
      </div>
      <br />
      <div>
        <a href={wledUrl('wiki/Contributors-and-credits')} target="_blank" rel="noreferrer">
          Contributors, dependencies and special thanks
        </a>
      </div>
      <div>A huge thank you to everyone who helped me create WLED!</div>
      <br />
      <div>(c) 2016-2021 Christian Schwinne</div>
      <div>
        <i>
          Licensed under the{' '}
          <a href={wledUrl('blob/master/LICENSE')} target="_blank" rel="noreferrer">
            MIT license
          </a>
        </i>
      </div>
      <br />
      <br />
      Server message: <span class="sip"> Response error! </span>
      <hr />
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="submit">Save & Reboot</button>
    </form>
  );
}

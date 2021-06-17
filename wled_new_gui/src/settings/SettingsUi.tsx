import { JSX } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { useAction, useSelector, useSelector2 } from 'predux/preact';
import { selectLocalSettings, updateLocalSettings } from '../features/localSettings';
import { selectSettings } from '../features/settings';
import { selectInfo } from '../features/wledState';
import { useStateFromProps } from '../welcome/useStateFromProps';
import { CheckInput, ConvertCheckInput, Desc, NumInput, TextInput, wikiUrl } from './Controls';
import { bindGetPathProp } from './pathProps';

const kRandomBackgroundUrl = 'https://picsum.photos/1920/1080';

export function SettingsUi(): JSX.Element {
  const info = useSelector(selectInfo);
  const id = useSelector2(selectSettings, (s) => s.id);
  const [serverDesc, setServerDesc] = useStateFromProps(id.name);
  const [syncToggle, setSyncToggle] = useStateFromProps(info.str ?? false);

  const [settings, updateSettings] = useState(useSelector(selectLocalSettings));
  const [message, setMessage] = useState({ message: '', success: true });
  const form = useRef<HTMLFormElement>(null);
  const uls = useAction(updateLocalSettings);

  const getProp = bindGetPathProp(settings, updateSettings);

  const Save = () => {
    try {
      uls(settings);
      setMessage({
        message: '\u2714 Local UI settings saved!',
        success: true,
      });
    } catch (e) {
      setMessage({
        message: `⚠ Settings JSON saving failed. (${e})`,
        success: false,
      });
    }
    if (syncToggle !== info.str || serverDesc != id.name) {
      form.current?.submit();
    }
  };

  return (
    <form method="post" ref={form} class="settings">
      <div style="position:sticky;top:0;background-color:#222;">
        <div class="helpB">
          <a href={wikiUrl('Settings#user-interface-settings')} target="_blank" rel="noreferrer">
            <button type="button">?</button>
          </a>
        </div>
        <a href="/settings">
          <button type="button">Back</button>
        </a>
        <button type="button" onClick={() => Save()}>
          Save
        </button>
        {message.message && (
          <div><span style={message.success ? 'color:green;' : 'color:red;'}>{message.message}</span></div>
        )}
        <hr />
      </div>
      <h2>Web Setup</h2>
      <Desc desc="Server description: ">
        <TextInput pvalue={serverDesc} set={setServerDesc} maxLength={32} />
      </Desc>
      <Desc desc="Sync button toggles both send and receive: ">
        <CheckInput pvalue={syncToggle} set={setSyncToggle} />
      </Desc>
      <div>
        <i>
          The following UI customization settings are unique both to the WLED device and this
          browser.
          <br />
          You will need to set them again if using a different browser, device or WLED IP address.
          <br />
          Refresh the main UI to apply changes.
        </i>
      </div>
      <h3>Color selection methods</h3>
      <Desc desc="Color Wheel: ">
        <CheckInput {...getProp('ui.colors.picker')} />
      </Desc>
      <Desc desc="RGB sliders: ">
        <CheckInput {...getProp('ui.colors.rgb')} />
      </Desc>
      <Desc desc="Quick color selectors: ">
        <CheckInput {...getProp('ui.colors.quick')} />
      </Desc>
      <Desc desc="HEX color input: ">
        <CheckInput {...getProp('ui.colors.hex')} />
      </Desc>
      <h3>UI Appearance</h3>
      <Desc desc="Show button labels: ">
        <CheckInput {...getProp('ui.labels')} />
      </Desc>
      <Desc desc="Show bottom tab bar in PC mode: ">
        <CheckInput {...getProp('ui.pcmbot')} />
      </Desc>
      <Desc desc="Show preset IDs: ">
        <CheckInput {...getProp('ui.pid')} />
      </Desc>
      <Desc desc="I hate dark mode: ">
        <ConvertCheckInput
          {...getProp('theme.base')}
          to={(v) => v !== 'dark'}
          from={(v) => (v ? 'light' : 'dark')}
        />
      </Desc>
      {settings.theme.base !== 'dark' && (
        <div>
          <i>Why would you? </i>&#x1F97A;
        </div>
      )}
      <Desc desc="Button opacity: ">
        <NumInput min={0.0} max={1.0} step={0.01} {...getProp('theme.alpha.tab')} />
      </Desc>
      <Desc desc="Background opacity: ">
        <NumInput min={0.0} max={1.0} step={0.01} {...getProp('theme.alpha.bg')} />
      </Desc>
      <Desc desc="BG HEX color: ">
        <TextInput maxLength={9} {...getProp('theme.color.bg')} />
      </Desc>
      <Desc desc="BG image URL: ">
        <TextInput {...getProp('theme.bg.url')} />
      </Desc>
      <Desc desc="Random BG image: ">
        <ConvertCheckInput
          {...getProp('theme.bg.url')}
          to={(v) => v === kRandomBackgroundUrl}
          from={(v) => (v ? kRandomBackgroundUrl : '')}
        />
      </Desc>
      <hr />
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="button" onClick={() => Save()}>
        Save
      </button>
    </form>
  );
}

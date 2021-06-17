import { JSX } from 'preact';
import Router from 'preact-router';
import { useEffect } from 'preact/hooks';
import { useSelector } from 'predux/preact';
import { selectSettingsLoaded } from '../features/settings';
import { selectInfoLoaded } from '../features/wledState';
import { SettingsDmx } from './SettingsDmx';
import { SettingsLeds } from './SettingsLeds';
import { SettingsSec } from './SettingsSec';
import { SettingsSync } from './SettingsSync';
import { SettingsTime } from './SettingsTime';
import { SettingsUi } from './SettingsUi';
import { SettingsUm } from './SettingsUm';
import { SettingsWifi } from './SettingsWifi';

function SettingLink(props: { to: string; caption: string }) {
  return (
    <div class="flex-fill settings-list-item btn m-2 mx-3 rounded-0">
      <a href={props.to}>{props.caption}</a>
    </div>
  );
}

const path = '/settings';

export function Settings(): JSX.Element {
  const settingsLoaded = useSelector(selectSettingsLoaded);
  const infoLoaded = useSelector(selectInfoLoaded);
  useEffect(() => {
    document.title = 'WLED Settings';
  }, []);

  if (!settingsLoaded || !infoLoaded) {
    return <div class="settings h-100">Loading settings</div>;
  }

  return (
    <div class="settings h-100">
      <Router>
        <div path={path} class="d-flex flex-column h-100">
          <SettingLink to="/" caption="Back" />
          <SettingLink to={`${path}/wifi`} caption="WiFi Setup" />
          <SettingLink to={`${path}/leds`} caption="LED Preferences" />
          <SettingLink to={`${path}/ui`} caption="User Interface" />
          <SettingLink to={`${path}/sync`} caption="Sync Interfaces" />
          <SettingLink to={`${path}/time`} caption="Time & Macros" />
          <SettingLink to={`${path}/um`} caption="Usermods" />
          <SettingLink to={`${path}/sec`} caption="Security & Updates" />
        </div>

        <SettingsUi path={`${path}/ui`} />
        <SettingsWifi path={`${path}/wifi`} />
        <SettingsLeds path={`${path}/leds`} />
        <SettingsSync path={`${path}/sync`} />
        <SettingsTime path={`${path}/time`} />
        <SettingsSec path={`${path}/sec`} />
        <SettingsUm path={`${path}/um`} />
        <SettingsDmx path={`${path}/dmx`} />
      </Router>
    </div>
  );
}

export default Settings;

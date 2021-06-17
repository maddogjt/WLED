import { JSX } from 'preact';
import { useState } from 'preact/hooks';
import { useAction, useSelector } from 'predux/preact';
import { selectServer, sendCommand } from '../features/connection';
import { selectUiSettings, selectThemeSettings, updateThemeSettings, updateUiSettings } from '../features/localSettings';
import { selectInfo, selectState } from '../features/wledState';
import { LiveView } from './LiveView';
import { Slider } from './Slider';

export function Header(props: {
  showInfo: boolean;
  setShowInfo: (s: boolean) => void;
}): JSX.Element {
  const info = useSelector(selectInfo);
  const server = useSelector(selectServer);
  const { on } = useSelector(selectState);
  const uUiSettings = useAction(updateUiSettings);
  const updateTheme = useAction(updateThemeSettings);
  const uiSettings = useSelector(selectUiSettings);
  const themeSettings = useSelector(selectThemeSettings);
  const [liveView, setLiveView] = useState(false);
  const [syncActive, setSyncActive] = useState(false);
  const [timer, setTimer] = useState(false);
  const [brightness, setBrightness] = useState(50);

  const toggleNodes = () => {
    return;
  };
  const togglePcMode = (_b: boolean) => {
    return;
  };

  const toggleDebug = () => {
    uUiSettings({ labels: !uiSettings.labels });
  };
    const toggleTheme = () => {
      updateTheme({ base: themeSettings.base === 'dark' ? 'light' : 'dark' });
    };

  return (
    <div
      class={`header d-flex flex-wrap justify-content-around ${
        !uiSettings.labels ? 'hide-labels' : ''
      }`}
    >
      <div class="tab top flex-grow-1 flex-shrink-0">
        <button
          id="buttonPower"
          title="Power"
          onClick={() => sendCommand({ on: !on, transition: 3 })}
          class={on ? 'active' : ''}
        >
          <i class="icons">&#xe08f;</i>
          <p class="tab-label">Power</p>
        </button>
        <button title="Timer" onClick={() => setTimer((p) => !p)} class={timer ? 'active' : ''}>
          <i class="icons">&#xe2a2;</i>
          <p class="tab-label">Timer</p>
        </button>
        <button
          title="Sync"
          onClick={() => setSyncActive((p) => !p)}
          class={syncActive ? 'active' : ''}
        >
          <i class="icons">&#xe116;</i>
          <p class="tab-label">Sync</p>
        </button>
        <button
          title="Peek"
          onClick={() => setLiveView((p) => !p)}
          class={liveView ? 'active' : ''}
        >
          <i class="icons">&#xe410;</i>
          <p class="tab-label">Peek</p>
        </button>
        <button
          title="Info"
          id="buttonI"
          class={props.showInfo ? 'active' : ''}
          onClick={() => props.setShowInfo(!props.showInfo)}
        >
          <i class="icons">&#xe066;</i>
          <p class="tab-label">Info</p>
        </button>
        {info.ndc > 0 && (
          <button title="Nodes" id="buttonNodes" onClick={toggleNodes}>
            <i class="icons">&#xe22d;</i>
            <p class="tab-label">Nodes</p>
          </button>
        )}
        <a href="/settings">
          <button title="Settings">
            <i class="icons">&#xe0a2;</i>
            <p class="tab-label">Config</p>
          </button>
        </a>
        <button title="PC Mode" id="buttonPcm" onClick={() => togglePcMode(true)}>
          <i class="icons">&#xe23d;</i>
          <p class="tab-label">PC Mode</p>
        </button>
      </div>
      <div id="briwrap" class="my-2">
        <p class="my-0 tab-label" onClick={toggleTheme}>Brightness</p>

        <div class="d-flex align-items-center">
          <i class="icons color-d" onClick={toggleDebug}>
            &#xe2a6;
          </i>
          <Slider
            value={brightness}
            onChange={(e) => setBrightness(e.currentTarget.valueAsNumber)}
            class="flex-fill"
          />
        </div>
      </div>
      {liveView && <LiveView host={server} />}
    </div>
  );
}

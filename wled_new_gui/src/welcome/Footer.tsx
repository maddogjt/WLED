import { selectUiSettings } from '../features/localSettings';
import { useSelector } from 'predux/preact';
import { JSX } from 'preact';

export function Footer(props: { page: number; setPage: (p: number) => void }): JSX.Element {
  const uiSettings = useSelector(selectUiSettings);
  return (
    <div class={`d-flex flex-row tab footer ${!uiSettings.labels ? 'hide-labels' : ''}`} id="bot">
      <button
        class={'tablinks' + (props.page === 0 ? ' active' : '')}
        onClick={() => props.setPage(0)}
      >
        <i class="icons">&#xe2b3;</i>
        <p class="tab-label">Colors</p>
      </button>
      <button
        class={'tablinks' + (props.page === 1 ? ' active' : '')}
        onClick={() => props.setPage(1)}
      >
        <i class="icons">&#xe23d;</i>
        <p class="tab-label">Effects</p>
      </button>
      <button
        class={'tablinks' + (props.page === 2 ? ' active' : '')}
        onClick={() => props.setPage(2)}
      >
        <i class="icons">&#xe34b;</i>
        <p class="tab-label">Segments</p>
      </button>
      <button
        class={'tablinks' + (props.page === 3 ? ' active' : '')}
        onClick={() => props.setPage(3)}
      >
        <i class="icons">&#xe04c;</i>
        <p class="tab-label">Favorites</p>
      </button>
    </div>
  );
}

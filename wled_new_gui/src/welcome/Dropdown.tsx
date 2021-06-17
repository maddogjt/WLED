import { ComponentChildren, JSX } from 'preact';
import { useState } from 'preact/hooks';

export function Dropdown(props: { children?: ComponentChildren; title?: string }): JSX.Element {
  const [display, setDisplay] = useState(false);

  return (
    <div class="dropdown">
      <div title={props.title} class="dropdown-button" onClick={() => setDisplay(!display)}>
        <i class="icons">&#xe0a2;</i>
      </div>
      {display && (
        <>
          <div class="dropdown-menu show" data-bs-popper onClick={(e) => e.stopPropagation()}>
            {props.children}
          <div class="dropdown-coverup" onClick={() => setDisplay(false)} />
          </div>
        </>
      )}
    </div>
  );
}

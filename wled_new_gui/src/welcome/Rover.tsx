import { JSX } from 'preact';

export function Rover(): JSX.Element {
  return (
    <div id="rover" class="modal2">
      <i class="icons huge">&#xe410;</i>
      <br />
      <div id="lv">?</div>
      <br />
      <br />
      To use built-in effects, use an override button below.
      <br />
      You can return to realtime mode by pressing the star in the top left corner.
      <br />
      {/* <button class="btn" onClick={() => setLor(1)}>
        Override once
      </button> */}
      {/* <button class="btn" onClick={() => setLor(2)}>
        Override until reboot
      </button> */}
      <br />
      <span class="h">
        For best performance, it is recommended to turn off the streaming source when not in use.
      </span>
    </div>
  );
}

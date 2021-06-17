import { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export function LiveView(props: { host: string }): JSX.Element {
  const [background, setBackground] = useState('');

  useEffect(() => {
    console.info('Live-Preview websocket opening');
    const socket = new WebSocket('ws://' + props.host + '/ws');

    socket.onopen = function () {
      console.info('Live-Preview websocket is opened');
      socket.send("{'lv':true}");
    };

    socket.onclose = function () {
      console.info('Live-Preview websocket is closing');
    };

    socket.onerror = function (event) {
      console.error('Live-Preview websocket error:', event);
    };

    function updatePreview(leds: string[]) {
      let str = 'linear-gradient(90deg,';
      const len = leds.length;
      for (let i = 0; i < len; i++) {
        let leddata = leds[i];
        if (leddata.length > 6) leddata = leddata.substring(2);
        str += '#' + leddata;
        if (i < len - 1) str += ',';
      }
      str += ')';
      setBackground(str);
    }

    socket.onmessage = function (event) {
      try {
        const json = JSON.parse(event.data);
        if (json && json.leds) {
          requestAnimationFrame(function () {
            updatePreview(json.leds);
          });
        }
      } catch (err) {
        console.error('Live-Preview websocket error:', err);
      }
    };

    return () => {
      socket.close();
    };
  }, [props.host]);
  return <div class="liveview" style={{ background }} />;
}

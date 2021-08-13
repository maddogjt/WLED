import { JSX } from 'preact';
import { useSelector } from 'predux/preact';
import { selectInfo, refreshInfo, TInfo } from '../features/wledState';

function getRuntimeStr(rt: string) {
  const t = parseInt(rt);
  const days = Math.floor(t / 86400);
  const hrs = Math.floor((t - days * 86400) / 3600);
  const mins = Math.floor((t - days * 86400 - hrs * 3600) / 60);
  let str = days ? `${days} day${days > 1 ? 's' : ''}, ` : '';
  str += hrs || days ? `${hrs} hour${hrs > 1 ? 's' : ''}` : '';
  if (!days && hrs) str += ', ';
  if (t > 59 && !days) str += mins.toString() + ' min';
  if (t < 3600 && t > 59) str += ', ';
  if (t < 3600) str += (t - mins * 60).toString() + ' sec';
  return str;
}

function getRows(i: TInfo): [string, string, boolean][] {
  const heap = (i.freeheap / 1000).toFixed(1);
  let pwru = 'Not calculated';
  if (i.leds.pwr > 1000) {
    const pwr = i.leds.pwr / 1000;
    pwru = pwr.toFixed(pwr > 10 ? 0 : 1) + ' A';
  } else if (i.leds.pwr > 0) {
    pwru = `${50 * Math.round(i.leds.pwr / 50)} mA`;
  }

  const res: [string, string, boolean][] = [];
  const inforow = (k: string, v: string | number, u = '', customInner = false) => {
    res.push([k, `${v}${u}`, customInner]);
  };
  if (i.u) {
    for (const [k, val] of Object.entries<(string | number) | [string | number, string]>(i.u)) {
      if (Array.isArray(val)) {
        inforow(k, val[0], val[1], val[1] === undefined);
      } else {
        inforow(k, val, ' ', true);
      }
    }
  }

  inforow('Build', i.vid);
  inforow('Signal strength', i.wifi.signal + '% (' + i.wifi.rssi, ' dBm)');
  inforow('Uptime', getRuntimeStr(i.uptime));
  inforow('Free heap', heap, ' kB');
  inforow('Estimated current', pwru);
  inforow('Frames / second', i.leds.fps);
  inforow('MAC address', i.mac);
  inforow('Filesystem', `${i.fs.u}/${i.fs.t} kB (${Math.round((i.fs.u * 100) / i.fs.t)}%)`);
  inforow('Environment', i.arch + ' ' + i.core + ' (' + i.lwip + ')');

  return res;
}

export function Info(props: {
  show: boolean;
  setShow: (s: boolean) => void;
  setShowNodes: (s: boolean) => void;
}): JSX.Element {
  const info = useSelector(selectInfo);

  let vcn = 'Kuuhaku';
  if (info.ver.startsWith('0.12.')) vcn = 'Hikari';
  if (info.cn) vcn = info.cn;

  //   `v${i.ver} "${vcn}"

  const rows = getRows(info);

  return (
    <div id="info" data-modalactive={props.show} class="modal2">
      <img
        class="wi"
        alt=""
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAFCAYAAAC5Fuf5AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABbSURBVChTlY9bDoAwDMNW7n9nwCipytQN4Z8tbrTHmDmF4oPzyldwRqp1SSdnV/NuZuzqerAByxXznBw3igkeFEfXyUuhK/yFM0CxJfyqXZEOc6/Sr9/bf7uIC5Nwd7orMvAPAAAAAElFTkSuQmCC"
      />
      <br />
      <div id="kv">
        {`v${info.ver} "${vcn}"`}
        <br />
        <br />
        <table class="infot w-100">
          {rows.map((v) => {
            return (
              <tr key={v[0]}>
                <td class="text-start p-1">{v[0]}</td>
                <td class="text-end p-1">
                  {v[2] ? <div dangerouslySetInnerHTML={{__html: v[1]}} /> : v[1]}
                </td>
              </tr>
            );
          })}
        </table>

        <div class="d-flex">
          <button class="btn infobtn flex-fill m-2" onClick={() => refreshInfo()}>
            Refresh
          </button>
          <button class="btn infobtn flex-fill m-2" onClick={() => props.setShow(false)}>
            Close Info
          </button>
        </div>
        <div class="d-flex">
          <button class="btn infobtn flex-fill m-2" onClick={() => props.setShowNodes(true)}>
            Instance List
          </button>
          <button class="btn infobtn flex-fill m-2" id="resetbtn">
            {/* onclick="cnfReset()"> */}
            Reboot WLED
          </button>
        </div>
        <span class="h">
          Made with <span class="heart">&#10084;&#xFE0E;</span> by Aircoookie and the WLED community
        </span>
      </div>
    </div>
  );
}

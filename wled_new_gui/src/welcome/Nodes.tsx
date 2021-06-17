import { JSX } from 'preact';
import { useSelector } from 'predux/preact';
import { selectInfo, TInfo } from '../features/wledState';
import { getJson } from '../features/connection';

type TNode = { nodes: { name: string; ip: string; type: number; vid: number }[] };
function loadNodes(info: TInfo | null) {
  if (!info) {
    return;
  }
  getJson<TNode>('/json/nodes')
    .then((json) => {
      populateNodes(info, json);
    })
    .catch((error) => {
      //   showToast(error, true);
      console.log(error);
    });
}

function bname(o: { name: string; ip: string }) {
  if (o.name == 'WLED') return o.ip;
  return o.name;
}

function inforow(key: string, val: string, unit = '') {
  return `<tr><td class="text-start p-1">${key}</td><td class="text-end p-1">${val}${unit}</td></tr>`;
}

function btype(b: number) {
  switch (b) {
    case 32:
      return 'ESP32';
    case 82:
      return 'ESP8266';
  }
  return '?';
}

function populateNodes(info: TInfo, n: TNode): void {
  let cn = '';
  let urows = '';
  let nnodes = 0;
  if (n.nodes) {
    n.nodes.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
    for (let x = 0; x < n.nodes.length; x++) {
      const o = n.nodes[x];
      if (o.name) {
        const url = `<button class="btn m-0 tab" onclick="location.assign('http://${
          o.ip
        }');">${bname(o)}</button>`;
        urows += inforow(url, `${btype(o.type)}<br><i>${o.vid == 0 ? 'N/A' : o.vid}</i>`);
        nnodes++;
      }
    }
  }
  if (info.ndc < 0) cn += `Instance List is disabled.`;
  else if (nnodes == 0) cn += `No other instances found.`;
  cn += `<table class="infot">
    ${urows}
    ${inforow('Current instance:', info.name)}
  </table>`;
  const d = window.document.getElementById('kn');
  if (d) d.innerHTML = cn;
}

export function Nodes(props: { show: boolean; setShow: (s: boolean) => void }): JSX.Element {
  const info = useSelector(selectInfo);

  return (
    <div id="nodes" class="modal2" data-modalactive={props.show}>
      <div id="ndlt">WLED instances</div>
      <div id="kn">Loading...</div>
      <br />
      <button class="btn infobtn" onClick={() => loadNodes(info)}>
        Refresh
      </button>
      <button class="btn infobtn" onClick={() => props.setShow(false)}>
        Close list
      </button>
      <br />
    </div>
  );
}

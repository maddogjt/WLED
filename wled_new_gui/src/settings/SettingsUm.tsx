/*
      var d = document;
      var umCfg = {};
      var pins = [6, 7, 8, 9, 10, 11];
      var pinO = ['rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd'],
        owner;
      var loc = false,
        locip;
      var urows;
      var numM = 0;
      function gId(s) {
        return d.getElementById(s);
      }
      function isO(i) {
        return i && typeof i === 'object' && !Array.isArray(i);
      }
      function S() {
        if (window.location.protocol == 'file:') {
          loc = true;
          locip = localStorage.getItem('locIp');
          if (!locip) {
            locip = prompt('File Mode. Please enter WLED IP!');
            localStorage.setItem('locIp', locip);
          }
        }
        GetV();
        if (numM > 0 || locip) ldS();
        else gId('um').innerHTML = 'No Usermods installed.';
      }
      function check(o, k) {
        var n = o.name.replace('[]', '').substr(-3);
        if (o.type == 'number' && n.substr(0, 3) == 'pin') {
          for (var i = 0; i < pins.length; i++) {
            if (k == pinO[i]) continue;
            if (o.value == pins[i] || o.value < -1 || o.value > 39) {
              o.style.color = 'red';
              break;
            } else o.style.color = o.value > 33 ? 'orange' : '#fff';
          }
        }
      }
      function getPins(o) {
        if (isO(o)) {
          for (const [k, v] of Object.entries(o)) {
            if (isO(v)) {
              owner = k;
              getPins(v);
              continue;
            }
            if (k.replace('[]', '').substr(-3) == 'pin') {
              if (Array.isArray(v)) {
                for (var i = 0; i < v.length; i++)
                  if (v[i] >= 0) {
                    pins.push(v[i]);
                    pinO.push(owner);
                  }
              } else {
                if (v >= 0) {
                  pins.push(v);
                  pinO.push(owner);
                }
              }
            } else if (Array.isArray(v)) {
              for (var i = 0; i < v.length; i++) getPins(v[i]);
            }
          }
        }
      }
      function addField(k, f, o, a = false) {
        if (isO(o)) {
          for (const [s, v] of Object.entries(o)) {
            addField(k, s, v);
          }
        } else if (Array.isArray(o)) {
          for (var j = 0; j < o.length; j++) {
            addField(k, f, o[j], true);
          }
        } else {
          var t, c;
          switch (typeof o) {
            case 'boolean':
              t = 'checkbox';
              c = o ? `checked value="on"` : '';
              break;
            case 'number':
              t = 'number';
              c = `value="${parseInt(o, 10)}"`;
              break;
            case 'string':
              t = 'text';
              c = `value="${o}"`;
              break;
            default:
              t = 'text';
              c = `value="${o}"`;
              break;
          }
          // https://stackoverflow.com/questions/11657123/posting-both-checked-and-unchecked-checkboxes
          if (t == 'checkbox')
            urows += `<input type="hidden" name="${k}_${f}${a ? '[]' : ''}" value="off">`;
          urows += `${f}: <input type="${t}" name="${k}_${f}${
            a ? '[]' : ''
          }" ${c} oninput="check(this,'${k}')"><br>`;
        }
      }
      function ldS() {
        var url = (loc ? `http://${locip}` : '') + '/cfg.json';
        fetch(url, {
          method: 'get',
        })
          .then((res) => {
            if (!res.ok) gId('lserr').style.display = 'inline';
            return res.json();
          })
          .then((json) => {
            umCfg = json.um;
            getPins(json);
            urows = '';
            if (isO(umCfg)) {
              for (const [k, o] of Object.entries(umCfg)) {
                urows += `<hr><h3>${k}</h3>`;
                addField(k, 'unknown', o);
              }
            }
            if (urows === '')
              urows =
                'Usermods configuration not found.<br>Press <i>Save</i> to initialize defaults.';
            gId('um').innerHTML = urows;
          })
          .catch(function (error) {
            gId('lserr').style.display = 'inline';
            console.log(error);
          });
      }
      function GetV() {}

*/

import { JSX } from 'preact';
import { wikiUrl } from './Controls';

export function SettingsUm(): JSX.Element {
  return (
    <form id="form_s" name="Sf" method="post">
      <div class="toprow">
        <div class="helpB">
          <a href={wikiUrl('Settings#usermod-settings')} target="_blank" rel="noreferrer">
            <button type="button">?</button>
          </a>
        </div>
        <a href="/settings">
          <button type="button">Back</button>
        </a>
        <button type="submit">Save</button>
        <br />
        <span id="lssuc" style="color: green; display: none">
          &#10004; Configuration saved!
        </span>
        <span id="lserr" style="color: red; display: none">
          &#9888; Could not load configuration.
        </span>
        <hr />
      </div>
      <h2>Usermod Setup</h2>
      <div id="um">Loading settings...</div>
      <hr />
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="submit">Save</button>
    </form>
  );
}

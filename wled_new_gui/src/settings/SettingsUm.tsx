import { JSX } from 'preact';
import { useSelector } from 'predux/preact';
import { selectSettings } from '../features/settings';
import { useStateFromProps } from '../welcome/useStateFromProps';
import { CheckInput, Desc, NumInput, TextInput, wikiUrl } from './Controls';
import { bindGetPathPropRaw } from './pathProps';
import { PinInput, usePins } from './Pins';

type FIELD = {
  path: (string | number)[];
  type: string;
  isPin?: boolean;
};

function getFields(path: (string | number)[], field: any, isPin?: boolean): FIELD[] {
  const fields: FIELD[] = [];
  if (Array.isArray(field)) {
    for (let i = 0; i < field.length; i++) {
      fields.push(...getFields([...path, i], field[i], isPin));
    }
  } else if (typeof field === 'object') {
    for (const [fieldName, o] of Object.entries(field)) {
      fields.push(...getFields([...path, fieldName], o, fieldName.endsWith('pin')));
    }
  } else {
    return [{ path: path, type: typeof field, isPin }];
  }
  return fields;
}

export function SettingsUm(): JSX.Element {
  const [settings, setSettings] = useStateFromProps(useSelector(selectSettings));
  const getPropRaw = bindGetPathPropRaw(settings, setSettings);
  const pins = usePins(settings);

  return (
    <form id="form_s" name="Sf" method="post" class="settings" /*onsubmit="svS(event)"*/>
      <div class="toprow">
        <div class="helpB">
          <a href={wikiUrl('Settings#usermod-settings')}>
            <button type="button">?</button>
          </a>
        </div>
        <a href="/settings">
          <button type="button">Back</button>
        </a>
        <button type="submit">Save</button>
        <br />
        <span id="lssuc" style="color:green; display:none">
          &#10004; Configuration saved!
        </span>
        <span id="lserr" style="color:red; display:none">
          &#9888; Could not load configuration.
        </span>
        <hr />
      </div>
      <h2>Usermod Setup</h2>
      {Object.keys(settings.um).length === 0 && <div>No Usermods installed</div>}
      {Object.entries(settings.um).map(([e, n]) => {
        const fields = getFields(['um', e], n);
        return (
          <div key={e}>
            <hr />
            <h3>{e}</h3>
            {fields.map((f) => (
              <Desc
                key={f.path.join('.')}
                desc={`${f.path
                  .slice(2)
                  .filter((v) => typeof v !== 'number')
                  .join(' ')}: `}
              >
                {f.type === 'boolean' && <CheckInput {...getPropRaw<boolean>(f.path)} />}
                {f.type === 'number' && f.isPin && (
                  <PinInput pins={pins} pId={f.path.join('.')} {...getPropRaw<number>(f.path)} />
                )}
                {f.type === 'number' && !f.isPin && (
                  <NumInput {...getPropRaw<number>(f.path)} class="xxl" />
                )}
                {f.type === 'string' && (
                  <TextInput {...getPropRaw<string>(f.path)} style="width:250px;" />
                )}
              </Desc>
            ))}
          </div>
        );
      })}
      <hr />
      <a href="/settings">
        <button type="button">Back</button>
      </a>
      <button type="submit">Save</button>
    </form>
  );
}

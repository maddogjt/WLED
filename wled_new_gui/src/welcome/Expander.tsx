import { ComponentChild, ComponentChildren } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { JSX } from 'preact';

export function Expander(props: {
  header?: string | ComponentChild;
  children?: ComponentChildren;
  class?: string;
  expanded?: boolean;
  onChange?: (v: boolean) => void;
}): JSX.Element {
  // destructure all props, allowing remainder to get pass to root div, this helps
  // support passing through "data-" and "aria-" attributes
  const { header, children, expanded: expIn, class: cls, onChange, ...rest } = props;

  const [expanded, setExpanded] = useState(expIn ?? false);
  useEffect(() => {
    if (expIn !== undefined) {
      setExpanded(expIn);
    }
  }, [expIn]);

  const updateExpanded = (e: boolean) => {
    setExpanded(e);
    onChange?.(e);
  };

  const pclass = cls ?? '';
  return (
    <div {...rest} data-expanded={expanded} class={`expander p-1 ${pclass}`}>
      <div class="expander__header">
        {header ?? ''}

        <i class={`icons e-icon color-d`} onClick={() => updateExpanded(!expanded)}>
          &#xe395;
        </i>
      </div>
      <div class="expander__body">{children}</div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { createElement, FunctionComponent } from 'preact';

/**
 * Check if two objects have a different shape
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
// eslint-disable-next-line @typescript-eslint/ban-types
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function shallowDiffers(a: any, b: any): boolean {
  for (const i in a) if (i !== '__source' && !(i in b)) return true;
  for (const i in b) if (i !== '__source' && a[i] !== b[i]) return true;
  return false;
}

/**
 * Memoize a component, so that it only updates when the props actually have
 * changed. This was previously known as `React.pure`.
 * @param {import('./internal').FunctionComponent} c functional component
 * @param {(prev: object, next: object) => boolean} [comparer] Custom equality function
 * @returns {import('./internal').FunctionComponent}
 */
export function memo<P>(
  c: FunctionComponent<P>,
  comparer?: (prev: object, next: object) => boolean
): FunctionComponent<P> {
  function shouldUpdate(this: any, nextProps: any): boolean {
    const ref = this.props.ref;
    const updateRef = ref == nextProps.ref;
    if (!updateRef && ref) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      ref.call ? ref(null) : (ref.current = null);
    }

    if (!comparer) {
      return shallowDiffers(this.props, nextProps);
    }

    return !comparer(this.props, nextProps) || !updateRef;
  }

  function Memoed(this: any, props: any) {
    this.shouldComponentUpdate = shouldUpdate;
    return createElement(c, props);
  }
  Memoed.displayName = `Memo(${c.displayName || c.name})`;
  Memoed.prototype.isReactComponent = true;
  Memoed._forwarded = true;
  return Memoed;
}

import { JSX } from 'preact';
import { useEffect } from 'preact/hooks';

export function Toast(props: { toast?: [boolean, string]; clearToast: () => void }): JSX.Element {
  const { toast, clearToast } = props;

  // When a toast is set, and it's not an error, set a timeout to clear the toast
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(
        () => {
          clearToast();
        },
        toast[0] ? 5400 : 2900
      );
      return () => clearTimeout(timeout);
    }
  }, [clearToast, toast]);

  return toast ? (
    <div id="toasty" class={toast[0] ? 'error' : 'show'}>
      {toast[1]}
    </div>
  ) : (
    <></>
  );
}

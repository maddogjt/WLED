import { JSX } from 'preact';
import { useEffect } from 'preact/hooks';

export interface ToastDef {
  error: boolean;
  message: string;
}

export function Toast(props: { toast?: ToastDef; clearToast: () => void }): JSX.Element {
  const { toast, clearToast } = props;

  // When a toast is set, and it's not an error, set a timeout to clear the toast
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(
        () => {
          clearToast();
        },
        toast.error ? 5400 : 2900
      );
      return () => clearTimeout(timeout);
    }
  }, [clearToast, toast]);

  return toast ? (
    <div id="toasty" class={toast.error ? 'error' : 'show'}>
      {toast.message}
    </div>
  ) : (
    <></>
  );
}

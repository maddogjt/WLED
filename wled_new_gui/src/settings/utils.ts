import { RefObject } from 'preact';
import { uploadFileAsync } from '../features/connection';
import { ToastDef } from './Toast';

export function* range(start: number, end: number): Generator<number, void, void> {
  while (start < end) {
    yield start;
    start++;
  }
}

export function uploadFile(
  ref: RefObject<HTMLInputElement>,
  name: string,
  setToast: (t?: ToastDef) => void
): boolean {
  if (!ref.current?.files) {
    return false;
  }
  setToast(undefined);
  ref.current.value = '';
  uploadFileAsync(ref.current.files, name)
    .then((res) => setToast({ error: false, message: res }))
    .catch((reason) => setToast({ error: true, message: reason }));

  return false;
}

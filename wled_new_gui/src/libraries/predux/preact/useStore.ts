import { useContext } from "preact/hooks";
import { getStoreContext } from "./storeContext";
import { DefaultRootState, Store } from "../store";

export function useStore<S = DefaultRootState>(): Store<S> {
  return useContext(getStoreContext<S>());
}

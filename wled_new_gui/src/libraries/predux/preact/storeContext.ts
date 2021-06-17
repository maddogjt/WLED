import { Context, createContext } from "preact";
import { DefaultRootState, Store } from "../store";

const StoreContext: Context<unknown> = createContext<unknown>(null);

export function getStoreContext<S = DefaultRootState>(): Context<Store<S>> {
  return StoreContext as Context<Store<S>>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DefaultRootState {}

export type Listener<S> = (state: S, action?: Action<S>) => void;
export type Unsubscribe = () => void;

export type Action<S> = (state: S, ...args: any[]) => void | Partial<S> | Promise<Partial<S>>;

export type ActionArgs<T extends Action<S>, S = unknown> = T extends (
  state: S,
  ...args: infer Q
) => unknown
  ? Q
  : never;

export type BoundResult<R> = R extends Promise<unknown> ? Promise<void> : void;

export type BoundAction<S, A extends Action<S>> = (
  ...args: ActionArgs<A, S>
) => BoundResult<ReturnType<A>>;

export interface Store<S = DefaultRootState> {
  setState(update: Partial<S>, action?: Action<S>): void;
  getState(): S;
  subscribe(f: Listener<S>): Unsubscribe;
  action: <T extends Action<S>>(action: T)=> BoundAction<S, T>;
}

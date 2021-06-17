type ReducerArgs<T> = T extends (state: any, ...args: infer Q) => any ? Q : never;

declare type StateSliceAction<RS, CR extends SliceAction> = (
  state: RS,
  ...args: ReducerArgs<CR>
) => RS | void | Partial<RS>;

export declare type SliceAction<SL = any, A extends any[] = any[]> = (
  state: SL,
  ...args: A
) => SL | void | Partial<SL>;

export declare type SliceActions<SL> = {
  [K: string]: SliceAction<SL, any[]>;
};

export declare type StateSliceActions<RS, SLA extends SliceActions<any>> = {
  [Type in keyof SLA]: StateSliceAction<RS, SLA[Type]>;
};

export declare interface CreateSliceOptions<
  State = any,
  CR extends SliceActions<State> = SliceActions<State>,
  Name extends string = string
> {
  /**
   * The slice's name. Used to namespace the generated action types.
   */
  name: Name;
  /**
   * The initial state to be returned by the slice reducer.
   */
  initialState: State;
  /**
   * A mapping from action types to action-type-specific *case reducer*
   * functions. For every action type, a matching action creator will be
   * generated using `createAction()`.
   */
  actions: CR;
  /**
     * A callback that receives a *builder* object to define
     * case reducers via calls to `builder.addCase(actionCreatorOrType, reducer)`.
     *
     * Alternatively, a mapping from action types to action-type-specific *case reducer*
     * functions. These reducers should have existing action types used
     * as the keys, and action creators will _not_ be generated.
     *
     * @example
  ```ts
  import { createAction, createSlice, Action, AnyAction } from '@reduxjs/toolkit'
  const incrementBy = createAction<number>('incrementBy')
  const decrement = createAction('decrement')

  interface RejectedAction extends Action {
    error: Error
  }

  function isRejectedAction(action: AnyAction): action is RejectedAction {
    return action.type.endsWith('rejected')
  }


  ```
     */
  // extraReducers?:
  //   | CaseReducers<NoInfer<State>, any>
  //   | ((builder: ActionReducerMapBuilder<NoInfer<State>>) => void);
}

export interface Slice<State, CaseReducers extends SliceActions<State> = SliceActions<State>> {
  name: string;
  initialState: State;
  sliceActions: CaseReducers;
  actions: <RS>(accessor: Accessor<RS, State>) => StateSliceActions<RS, CaseReducers>;
}

export function createSlice<
  State,
  CaseReducers extends SliceActions<State>,
  Name extends string = string
>(options: CreateSliceOptions<State, CaseReducers, Name>): Slice<State, CaseReducers> {
  return {
    name: options.name,
    initialState: options.initialState,
    sliceActions: options.actions,
    actions: <RS>(accessor: Accessor<RS, State>): StateSliceActions<RS, CaseReducers> => {
      return createSliceActions(accessor, options.actions);
    },
  };
}

interface Accessor<State, Slice> {
  get(state: State): Slice;
  set(state: State, slice: Slice): State;
}

function makeAction<RS, SL, SLA extends SliceAction<SL> = SliceAction<SL>>(
  action: SLA,
  accessor: Accessor<RS, SL>
): StateSliceAction<RS, SLA> {
  return (state: RS, ...args: ReducerArgs<SLA>): Partial<RS> => {
    const slice = accessor.get(state);
    const res = action(slice, ...args);

    return accessor.set(state, {...slice, ...res});
  };
}
export function createSliceActions<RS, SL, SLA extends SliceActions<SL> = SliceActions<SL>>(
  accessor: Accessor<RS, SL>,
  actions: SLA
): StateSliceActions<RS, SLA> {
  const result: StateSliceActions<RS, SLA> = {} as StateSliceActions<RS, SLA>;
  for (const name in actions) {
    const action = actions[name];
    result[name] = makeAction<RS, SL, typeof action>(action, accessor);
  }
  return result;
}

export function accessorFromState<RS, K extends keyof RS>(key: K): Accessor<RS, RS[K]> {
  return {
    get: (state: RS): RS[K] => {
      return state[key];
    },
    set: (state: RS, slice: RS[K]): RS => {
      return { ...state, ...{[key]: slice} };
    },
  };
}

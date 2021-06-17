import { useEffect, useLayoutEffect, useReducer, useRef } from "preact/hooks";
import { DefaultRootState } from "../store";
import { useStore } from "./useStore";

type Selector<TSelected, S=DefaultRootState> = (state: S) => TSelected;
function refEquality<TS>(a: TS, b: TS) {
  return a === b;
}
// Heavily inspired by the react-redux implementation
// https://github.com/reduxjs/react-redux/blob/master/src/hooks/useSelector.js

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useSelector<S=DefaultRootState, TSelected = unknown>(
  selector: Selector<TSelected, S>
): TSelected {
  type Sel = Selector<TSelected, S>;
  const store = useStore<S>();
  const [, forceRerender] = useReducer((s) => s + 1, 0);

  const selectorRef = useRef<Sel | undefined>(undefined);
  const selectedStateRef = useRef<TSelected | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onChangeErrorRef = useRef<any>(undefined);
  const equalityFn = refEquality;

  let selectedState: TSelected | undefined;

  try {
    if (selectorRef.current !== selector || onChangeErrorRef.current) {
      const state = store.getState();
      const newSelectedState = selector(state);
      if (
        selectedStateRef.current === undefined ||
        !equalityFn(newSelectedState, selectedStateRef.current)
      ) {
        selectedState = newSelectedState;
      } else {
        selectedState = selectedStateRef.current;
      }
    } else {
      selectedState = selectedStateRef.current;
    }
  } catch (err) {
    let errorMessage = `An error occurred while selecting the store state: ${err.message}.`;

    if (onChangeErrorRef.current) {
      errorMessage +=
        `\nThe error may be related with this previous error:\n${onChangeErrorRef.current.stack}` +
        "\n\nOriginal stack trace:";
    }

    throw new Error(errorMessage);
  }

  useIsomorphicLayoutEffect(() => {
    selectorRef.current = selector;
    selectedStateRef.current = selectedState;
    onChangeErrorRef.current = undefined;
  });

  useIsomorphicLayoutEffect(() => {
    const checkForUpdates = () => {
      try {
        if (selectorRef.current === undefined) {
          throw "undefined selector ref";
        }

        const newSelectedState = selectorRef.current(store.getState());

        if (newSelectedState === selectedStateRef.current) {
          return;
        }

        selectedStateRef.current = newSelectedState;
      } catch (err) {
        onChangeErrorRef.current = err;
      }

      forceRerender({});
    };

    const unsubscribe = store.subscribe(checkForUpdates);
    checkForUpdates();

    return () => unsubscribe();
  }, [store]);

  if (selectedState === undefined) {
    throw "undefined state ref";
  }

  return selectedState;
}

export function useSelector2<S = DefaultRootState, TSelected = unknown, TSubSelected = TSelected>(
  selector: Selector<TSelected, S>,
  subSelector?: (d: TSelected) => TSubSelected
): TSubSelected {
  type Sel = Selector<TSelected, S>;
  const store = useStore<S>();
  const [, forceRerender] = useReducer((s) => s + 1, 0);

  const selectorRef = useRef<Sel | undefined>(undefined);
  const selectedStateRef = useRef<TSubSelected | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onChangeErrorRef = useRef<any>(undefined);
  const equalityFn = refEquality;

  let selectedState: TSubSelected | undefined;

  try {
    if (selectorRef.current !== selector || onChangeErrorRef.current) {
      const state = store.getState();
      const newSelectedState = (selector(state));
      const newSubSelectedState = subSelector?.(newSelectedState) ?? (newSelectedState) as unknown as TSubSelected;
      if (
        selectedStateRef.current === undefined ||
        !equalityFn(newSubSelectedState, selectedStateRef.current)
      ) {
        selectedState = newSubSelectedState;
      } else {
        selectedState = selectedStateRef.current;
      }
    } else {
      selectedState = selectedStateRef.current;
    }
  } catch (err) {
    let errorMessage = `An error occurred while selecting the store state: ${err.message}.`;

    if (onChangeErrorRef.current) {
      errorMessage +=
        `\nThe error may be related with this previous error:\n${onChangeErrorRef.current.stack}` +
        '\n\nOriginal stack trace:';
    }

    throw new Error(errorMessage);
  }

  useIsomorphicLayoutEffect(() => {
    selectorRef.current = selector;
    selectedStateRef.current = selectedState;
    onChangeErrorRef.current = undefined;
  });

  useIsomorphicLayoutEffect(() => {
    const checkForUpdates = () => {
      try {
        if (selectorRef.current === undefined) {
          throw 'undefined selector ref';
        }

        const newSelectedState = selectorRef.current(store.getState());
      const newSubSelectedState =
        subSelector?.(newSelectedState) ?? (newSelectedState as unknown as TSubSelected);

        if (newSubSelectedState === selectedStateRef.current) {
          return;
        }

        selectedStateRef.current = newSubSelectedState;
      } catch (err) {
        onChangeErrorRef.current = err;
      }

      forceRerender({});
    };

    const unsubscribe = store.subscribe(checkForUpdates);
    checkForUpdates();

    return () => unsubscribe();
  }, [store]);

  if (selectedState === undefined) {
    throw 'undefined state ref';
  }

  return selectedState;
}

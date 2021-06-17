import { ComponentChildren } from 'preact';
import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'preact/hooks';

import { useEventCallback } from '../../hooks/useEventCallback';
import { clamp } from '../../utils/clamp';
import { memo } from '../../utils/memo';

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type InteractionType = "start" | 'end' | 'change';
export interface Interaction {
  left: number;
  top: number;
  type: InteractionType;
}

// Check if an event was triggered by touch
const isTouch = (event: MouseEvent | TouchEvent): event is TouchEvent => 'touches' in event;

// Returns a relative position of the pointer inside the node's bounding box
const getRelativePosition = (
  node: HTMLDivElement,
  event: MouseEvent | TouchEvent,
  type: InteractionType
): Interaction => {
  const rect = node.getBoundingClientRect();

  // Get user's pointer position from `touches` array if it's a `TouchEvent`
  const pointer = isTouch(event) ? event.touches[0] : event;

  return {
    left: clamp((pointer.pageX - (rect.left + window.pageXOffset)) / rect.width),
    top: clamp((pointer.pageY - (rect.top + window.pageYOffset)) / rect.height),
    type
  };
};

// Browsers introduced an intervention, making touch events passive by default.
// This workaround removes `preventDefault` call from the touch handlers.
// https://github.com/facebook/react/issues/19651
const preventDefaultMove = (event: MouseEvent | TouchEvent): void => {
  !isTouch(event) && event.preventDefault();
};

interface Props {
  onMove: (interaction: Interaction) => void;
  onMoveEnd: () => void;
  children: ComponentChildren;
}

const InteractiveBase = ({ onMove, onMoveEnd, ...rest }: Props) => {
  const container = useRef<HTMLDivElement>(null);
  const hasTouched = useRef(false);
  const [isDragging, setDragging] = useState(false);
  const onMoveCallback = useEventCallback<Interaction>(onMove);
  const onMoveEndCallback = useEventCallback<void>(onMoveEnd);

  // Prevent mobile browsers from handling mouse events (conflicting with touch ones).
  // If we detected a touch interaction before, we prefer reacting to touch events only.
  const isValid = (event: MouseEvent | TouchEvent): boolean => {
    if (hasTouched.current && !isTouch(event)) return false;
    if (!hasTouched.current) hasTouched.current = isTouch(event);
    return true;
  };

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Prevent text selection
      preventDefaultMove(event);

      // If user moves the pointer outside of the window or iframe bounds and release it there,
      // `mouseup`/`touchend` won't be fired. In order to stop the picker from following the cursor
      // after the user has moved the mouse/finger back to the document, we check `event.buttons`
      // and `event.touches`. It allows us to detect that the user is just moving his pointer
      // without pressing it down
      const isDown = isTouch(event) ? event.touches.length > 0 : event.buttons > 0;

      if (isDown && container.current) {
        onMoveCallback(getRelativePosition(container.current, event, 'change'));
      } else {
        setDragging(false);
      }
    },
    [onMoveCallback]
  );

  const handleMoveStart = useCallback(
    (nativeEvent: MouseEvent | TouchEvent) => {
      const el = container.current;

      // Prevent text selection
      preventDefaultMove(nativeEvent);

      // Interrupt "mousedown" call on mobiles
      if (!isValid(nativeEvent) || !el) return;

      // The node/ref must actually exist when user start an interaction.
      // We won't suppress the ESLint warning though, as it should probably be something to be aware of.
      el.focus();
      onMoveCallback(getRelativePosition(el, nativeEvent, 'start'));
      setDragging(true);
    },
    [onMoveCallback]
  );

  const handleMoveEnd = useCallback(() => {
    setDragging(false);
    onMoveEndCallback();
  }, [onMoveEndCallback]);

  const toggleDocumentEvents = useCallback(
    (state: boolean) => {
      // add or remove additional pointer event listeners
      const toggleEvent = state ? window.addEventListener : window.removeEventListener;
      toggleEvent(hasTouched.current ? 'touchmove' : 'mousemove', handleMove);
      toggleEvent(hasTouched.current ? 'touchend' : 'mouseup', handleMoveEnd);
    },
    [handleMove, handleMoveEnd]
  );

  useIsomorphicLayoutEffect(() => {
    toggleDocumentEvents(isDragging);
    return () => {
      isDragging && toggleDocumentEvents(false);
    };
  }, [isDragging, toggleDocumentEvents]);

  return (
    <div
      {...rest}
      class="interactive"
      ref={container}
      onTouchStart={handleMoveStart}
      onMouseDown={handleMoveStart}
      tabIndex={0}
      role="slider"
    />
  );
};

export const Interactive = memo(InteractiveBase);

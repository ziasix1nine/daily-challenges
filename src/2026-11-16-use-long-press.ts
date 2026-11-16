/**
 * Custom React hook that detects long press (press-and-hold) gestures.
 *
 * Useful for context menus, drag-to-reorder, or mobile-friendly interactions.
 * Distinguishes between click and long press via movement threshold and duration.
 *
 * @example
 * ```tsx
 * function LongPressButton() {
 *   const longPressProps = useLongPress({
 *     onLongPress: () => alert('Long pressed!'),
 *     onClick: () => console.log('Clicked'),
 *     delay: 500,
 *   });
 *
 *   return <button {...longPressProps}>Hold me</button>;
 * }
 * ```
 */

import { useCallback, useRef, useEffect } from 'react';

export interface UseLongPressOptions {
  /** Called when a long press is detected */
  onLongPress: (event: React.PointerEvent | React.MouseEvent | React.TouchEvent) => void;
  /** Called on a normal click (short press) */
  onClick?: (event: React.PointerEvent | React.MouseEvent | React.TouchEvent) => void;
  /** Duration in ms to consider a press "long" (default: 400) */
  delay?: number;
  /** Movement threshold in px before canceling long press (default: 10) */
  moveThreshold?: number;
  /** Whether the hook is active (default: true) */
  enabled?: boolean;
}

export function useLongPress({
  onLongPress,
  onClick,
  delay = 400,
  moveThreshold = 10,
  enabled = true,
}: UseLongPressOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetRef = useRef<EventTarget | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isLongPressTriggered = useRef(false);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    startPos.current = null;
  }, []);

  const start = useCallback(
    (event: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
      if (!enabled) return;

      // Ignore right-clicks and multi-touch
      if ('button' in event && event.button !== 0) return;
      if ('touches' in event && event.touches.length > 1) return;

      isLongPressTriggered.current = false;
      targetRef.current = event.target;

      const point = 'touches' in event ? event.touches[0] : event;
      startPos.current = { x: point.clientX, y: point.clientY };

      timeoutRef.current = setTimeout(() => {
        isLongPressTriggered.current = true;
        onLongPress(event);
      }, delay);
    },
    [enabled, delay, onLongPress]
  );

  const move = useCallback(
    (event: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
      if (!startPos.current || !timeoutRef.current) return;

      const point = 'touches' in event ? event.touches[0] : event;
      const dx = Math.abs(point.clientX - startPos.current.x);
      const dy = Math.abs(point.clientY - startPos.current.y);

      if (dx > moveThreshold || dy > moveThreshold) {
        clear();
      }
    },
    [moveThreshold, clear]
  );

  const end = useCallback(
    (event: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
      if (!enabled) return;

      const wasLongPress = isLongPressTriggered.current;
      clear();

      if (!wasLongPress && onClick && event.target === targetRef.current) {
        onClick(event);
      }
    },
    [enabled, onClick, clear]
  );

  // Cleanup on unmount
  useEffect(() => clear, [clear]);

  return {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: end,
    onPointerLeave: end,
    onPointerCancel: end,
    // Fallbacks for older browsers
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: end,
    onMouseLeave: end,
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: end,
    onTouchCancel: end,
  };
}

// Usage example:
// const handlers = useLongPress({
//   onLongPress: (e) => console.log('Long press detected', e),
//   onClick: () => console.log('Short click'),
//   delay: 500,
// });
// <div {...handlers}>Press and hold</div>

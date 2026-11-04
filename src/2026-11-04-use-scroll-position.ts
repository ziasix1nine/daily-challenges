import { useState, useEffect, useCallback } from 'react';

export interface ScrollPosition {
  x: number;
  y: number;
}

export interface UseScrollPositionOptions {
  /** Throttle the scroll updates in milliseconds. Default: 100 */
  throttle?: number;
  /** Element to track. Defaults to window */
  element?: HTMLElement | null;
}

/**
 * React hook that tracks the current scroll position of the window or a specific element.
 *
 * @param options Configuration options
 * @returns Current scroll position { x, y }
 *
 * @example
 * function ScrollIndicator() {
 *   const { y } = useScrollPosition();
 *   return <div>Scrolled: {y}px</div>;
 * }
 *
 * @example
 * const scrollPos = useScrollPosition({ throttle: 50, element: containerRef.current });
 */
export function useScrollPosition(
  options: UseScrollPositionOptions = {}
): ScrollPosition {
  const { throttle = 100, element = null } = options;

  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  const handleScroll = useCallback(() => {
    const target = element ?? window;
    const x = element
      ? (element as HTMLElement).scrollLeft
      : window.scrollX || window.pageXOffset;
    const y = element
      ? (element as HTMLElement).scrollTop
      : window.scrollY || window.pageYOffset;

    setPosition({ x, y });
  }, [element]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastRun = 0;

    const throttledHandler = () => {
      const now = Date.now();
      if (now - lastRun >= throttle) {
        handleScroll();
        lastRun = now;
      } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          handleScroll();
          lastRun = Date.now();
          timeoutId = null;
        }, throttle - (now - lastRun));
      }
    };

    const target = element ?? window;
    target.addEventListener('scroll', throttledHandler, { passive: true });

    // Initial position
    handleScroll();

    return () => {
      target.removeEventListener('scroll', throttledHandler);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScroll, throttle, element]);

  return position;
}

// Usage example (in a React component)
/*
import { useScrollPosition } from './use-scroll-position';

function App() {
  const { y } = useScrollPosition({ throttle: 16 });

  return (
    <div>
      <header style={{ position: 'sticky', top: 0, background: y > 50 ? '#eee' : '#fff' }}>
        Scrolled {Math.round(y)}px
      </header>
      <div style={{ height: '200vh' }}>Scroll me!</div>
    </div>
  );
}
*/

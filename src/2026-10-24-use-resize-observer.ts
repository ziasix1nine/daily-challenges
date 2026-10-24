/**
 * useResizeObserver
 *
 * A React hook that observes size changes of a DOM element using the ResizeObserver API.
 * Returns the element's content box size (width & height) and updates when it resizes.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const { width, height } = useResizeObserver(ref);
 *
 * return <div ref={ref}>{width} × {height}</div>;
 */

import { useEffect, useState, useRef, RefObject } from 'react';

export interface Size {
  width: number;
  height: number;
}

export function useResizeObserver<T extends Element>(
  targetRef: RefObject<T | null>
): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [targetRef]);

  return size;
}

// Usage example (in a component):
// const boxRef = useRef<HTMLDivElement>(null);
// const { width, height } = useResizeObserver(boxRef);
// <div ref={boxRef} style={{ resize: 'both', overflow: 'auto' }}>
//   Size: {width} × {height}
// </div>

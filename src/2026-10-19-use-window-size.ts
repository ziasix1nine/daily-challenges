/**
 * Custom React hook that tracks the browser window dimensions.
 * Updates on resize (with optional debounce) and returns current width/height.
 *
 * @param debounceMs - Optional debounce delay for resize events (default: 100)
 * @returns Object with `width` and `height` of the window
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const { width, height } = useWindowSize();
 *   return (
 *     <div>
 *       Viewport: {width} × {height}
 *       {width < 768 && <MobileMenu />}
 *     </div>
 *   );
 * }
 * ```
 */
import { useEffect, useState, useRef } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(debounceMs = 100): WindowSize {
  const [size, setSize] = useState<WindowSize>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs);
    };

    // Initial sync
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceMs]);

  return size;
}

// Usage example (uncomment to test in a React component):
//
// function Demo() {
//   const { width, height } = useWindowSize(150);
//   return (
//     <div style={{ padding: 16 }}>
//       <p>Current window size: {width}px × {height}px</p>
//       <p>{width < 640 ? 'Mobile' : width < 1024 ? 'Tablet' : 'Desktop'} layout</p>
//     </div>
//   );
// }

/**
 * Custom React hook to track the mouse position relative to the viewport or a specific element.
 *
 * @example
 * const { x, y } = useMousePosition();
 * // or
 * const ref = useRef<HTMLDivElement>(null);
 * const { x, y } = useMousePosition(ref);
 */
import { useEffect, useState, useRef, type RefObject } from 'react';

export interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition<T extends HTMLElement = HTMLElement>(
  elementRef?: RefObject<T | null>
): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const target = elementRef?.current ?? window;

    const handleMouseMove = (event: MouseEvent) => {
      if (elementRef?.current) {
        const rect = elementRef.current.getBoundingClientRect();
        setPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      } else {
        setPosition({
          x: event.clientX,
          y: event.clientY,
        });
      }
    };

    target.addEventListener('mousemove', handleMouseMove as EventListener);

    return () => {
      target.removeEventListener('mousemove', handleMouseMove as EventListener);
    };
  }, [elementRef]);

  return position;
}

// Usage example:
// function App() {
//   const ref = useRef<HTMLDivElement>(null);
//   const { x, y } = useMousePosition(ref);
//   return (
//     <div ref={ref} style={{ height: '100vh', border: '1px solid black' }}>
//       Mouse: {x}, {y}
//     </div>
//   );
// }

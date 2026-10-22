/**
 * useHover - A React hook that tracks whether an element is being hovered.
 *
 * @example
 * ```tsx
 * function Card() {
 *   const [hoverRef, isHovered] = useHover<HTMLDivElement>();
 *
 *   return (
 *     <div
 *       ref={hoverRef}
 *       style={{ background: isHovered ? '#f0f0f0' : '#fff' }}
 *     >
 *       {isHovered ? 'Hovered!' : 'Hover me'}
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export function useHover<T extends HTMLElement = HTMLElement>(): [
  (node: T | null) => void,
  boolean
] {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T | null>(null);

  const setRef = useCallback((node: T | null) => {
    if (ref.current) {
      // Clean up previous listeners if the node changes
      ref.current.removeEventListener('mouseenter', handleMouseEnter);
      ref.current.removeEventListener('mouseleave', handleMouseLeave);
    }

    ref.current = node;

    if (node) {
      node.addEventListener('mouseenter', handleMouseEnter);
      node.addEventListener('mouseleave', handleMouseLeave);
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  useEffect(() => {
    return () => {
      if (ref.current) {
        ref.current.removeEventListener('mouseenter', handleMouseEnter);
        ref.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [handleMouseEnter, handleMouseLeave]);

  return [setRef, isHovered];
}

// Usage example (for documentation / testing)
// const [hoverRef, isHovered] = useHover();
// <div ref={hoverRef}>Hover me - {isHovered ? 'Yes' : 'No'}</div>

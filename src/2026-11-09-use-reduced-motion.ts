/**
 * React hook that returns whether the user prefers reduced motion.
 *
 * Useful for accessibility: skip animations, reduce parallax, etc.
 * when `prefers-reduced-motion: reduce` is set.
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * const transition = prefersReducedMotion ? 'none' : 'all 0.3s ease';
 */
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }

    // Legacy
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, []);

  return prefersReduced;
}

/**
 * Optional: also expose a helper that returns animation duration based on preference.
 */
export function getAnimationDuration(
  prefersReducedMotion: boolean,
  normalMs: number = 300
): number {
  return prefersReducedMotion ? 0 : normalMs;
}

// ─── Usage example ───────────────────────────────────────────────

/*
import { useReducedMotion, getAnimationDuration } from './2026-11-09-use-reduced-motion';

function AnimatedCard() {
  const reduced = useReducedMotion();
  const duration = getAnimationDuration(reduced, 400);

  return (
    <div
      style={{
        transition: `transform ${duration}ms ease, opacity ${duration}ms ease`,
        transform: reduced ? 'none' : 'scale(1.02)',
      }}
    >
      Content
    </div>
  );
}
*/

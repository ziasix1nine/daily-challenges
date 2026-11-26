/**
 * Custom React hook to track the device's screen orientation.
 *
 * Useful for responsive layouts, games, or apps that need to react
 * to portrait/landscape changes (including lock/unlock events).
 *
 * @example
 * ```tsx
 * function OrientationIndicator() {
 *   const orientation = useOrientation();
 *
 *   return (
 *     <div>
 *       Current orientation: {orientation.type}
 *       {orientation.angle !== undefined && ` (${orientation.angle}°)`}
 *     </div>
 *   );
 * }
 * ```
 */
import { useEffect, useState } from 'react';

export interface ScreenOrientationState {
  /** Current orientation type, e.g. "portrait-primary", "landscape-secondary" */
  type: OrientationType | 'unknown';
  /** Angle in degrees (0, 90, 180, 270) when available */
  angle: number | undefined;
  /** Whether the orientation API is supported */
  isSupported: boolean;
}

const getOrientation = (): ScreenOrientationState => {
  if (typeof window === 'undefined' || !window.screen?.orientation) {
    return {
      type: 'unknown',
      angle: undefined,
      isSupported: false,
    };
  }

  const { type, angle } = window.screen.orientation;

  return {
    type,
    angle,
    isSupported: true,
  };
};

/**
 * Hook that returns the current screen orientation and updates on change.
 *
 * Falls back gracefully when the Screen Orientation API is unavailable
 * (e.g. older browsers or desktop without orientation lock support).
 */
export function useOrientation(): ScreenOrientationState {
  const [state, setState] = useState<ScreenOrientationState>(getOrientation);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.screen?.orientation) {
      return;
    }

    const orientation = window.screen.orientation;

    const handleChange = () => {
      setState(getOrientation());
    };

    orientation.addEventListener('change', handleChange);

    // Also listen to the older window event for broader compatibility
    window.addEventListener('orientationchange', handleChange);

    return () => {
      orientation.removeEventListener('change', handleChange);
      window.removeEventListener('orientationchange', handleChange);
    };
  }, []);

  return state;
}

// ——— Usage example (uncomment to test in a React component) ———
/*
import { useOrientation } from './2026-11-26-use-orientation';

export function Demo() {
  const { type, angle, isSupported } = useOrientation();

  if (!isSupported) {
    return <p>Screen Orientation API not supported in this browser.</p>;
  }

  return (
    <div>
      <p>Type: {type}</p>
      <p>Angle: {angle ?? 'n/a'}°</p>
    </div>
  );
}
*/

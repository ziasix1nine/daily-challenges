/**
 * useKeyPress - A React hook that tracks whether a specific key is currently pressed.
 *
 * Supports single keys or arrays of keys. Case-insensitive for letter keys.
 *
 * @example
 * ```tsx
 * function Game() {
 *   const isSpacePressed = useKeyPress(' ');
 *   const isArrowDown = useKeyPress(['ArrowDown', 's', 'S']);
 *
 *   return (
 *     <div>
 *       <p>Space: {isSpacePressed ? 'pressed' : 'released'}</p>
 *       <p>Down/S: {isArrowDown ? 'pressed' : 'released'}</p>
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useEffect, useState } from 'react';

type Key = string;

export function useKeyPress(targetKey: Key | Key[]): boolean {
  const [isPressed, setIsPressed] = useState(false);

  const keys = Array.isArray(targetKey) ? targetKey : [targetKey];
  const normalizedKeys = keys.map((k) => k.toLowerCase());

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (normalizedKeys.includes(event.key.toLowerCase())) {
        setIsPressed(true);
      }
    },
    [normalizedKeys]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (normalizedKeys.includes(event.key.toLowerCase())) {
        setIsPressed(false);
      }
    },
    [normalizedKeys]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Also handle blur to reset state if user tabs away while holding key
    const handleBlur = () => setIsPressed(false);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleKeyUp]);

  return isPressed;
}

// Usage example
// const isEscPressed = useKeyPress('Escape');
// const isShiftPressed = useKeyPress('Shift');

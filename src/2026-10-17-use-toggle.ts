/**
 * useToggle – a small, type-safe React hook for boolean state.
 *
 * Returns the current value plus helpers to toggle, set true, or set false.
 * Useful for modals, dropdowns, accordions, dark-mode switches, etc.
 *
 * @example
 * const [isOpen, toggle, open, close] = useToggle(false);
 *
 * <button onClick={toggle}>Toggle</button>
 * <button onClick={open}>Open</button>
 * <button onClick={close}>Close</button>
 * {isOpen && <Modal onClose={close} />}
 */

import { useCallback, useState } from 'react';

export type UseToggleReturn = [
  /** Current boolean value */
  value: boolean,
  /** Flip the current value */
  toggle: () => void,
  /** Force the value to `true` */
  setTrue: () => void,
  /** Force the value to `false` */
  setFalse: () => void,
];

/**
 * React hook that manages a boolean state with convenient setters.
 *
 * @param initialValue - Starting boolean value (default: `false`)
 * @returns Tuple of [value, toggle, setTrue, setFalse]
 */
export function useToggle(initialValue = false): UseToggleReturn {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse];
}

// ---------------------------------------------------------------------------
// Usage example (uncomment and adapt in a React component)
// ---------------------------------------------------------------------------
/*
import { useToggle } from './2026-10-17-use-toggle';

function Example() {
  const [isOpen, toggle, open, close] = useToggle(false);

  return (
    <div>
      <button type="button" onClick={toggle}>
        {isOpen ? 'Close' : 'Open'} menu
      </button>
      <button type="button" onClick={open}>Force open</button>
      <button type="button" onClick={close}>Force close</button>
      {isOpen && <nav>Menu content…</nav>}
    </div>
  );
}
*/

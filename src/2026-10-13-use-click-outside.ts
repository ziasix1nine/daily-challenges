/**
 * Custom React hook that detects clicks (or touches) outside a referenced element.
 * Useful for closing dropdowns, modals, menus, etc.
 *
 * @example
 * ```tsx
 * function Dropdown() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const [open, setOpen] = useState(false);
 *
 *   useClickOutside(ref, () => setOpen(false));
 *
 *   return (
 *     <div ref={ref}>
 *       <button onClick={() => setOpen(o => !o)}>Toggle</button>
 *       {open && <ul>...</ul>}
 *     </div>
 *   );
 * }
 * ```
 */

import { useEffect, useRef, type RefObject } from 'react';

export interface UseClickOutsideOptions {
  /** Whether the listener is active. Defaults to true. */
  enabled?: boolean;
  /** Events to listen for. Defaults to ['mousedown', 'touchstart']. */
  events?: Array<'mousedown' | 'mouseup' | 'touchstart' | 'touchend' | 'click'>;
}

/**
 * Calls `handler` when a pointer event occurs outside the element referenced by `ref`.
 *
 * @param ref - A React ref pointing to the element that should be considered "inside".
 * @param handler - Callback invoked when a click/touch happens outside the ref.
 * @param options - Optional configuration.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  options: UseClickOutsideOptions = {}
): void {
  const { enabled = true, events = ['mousedown', 'touchstart'] } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: Event) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      handlerRef.current(event as MouseEvent | TouchEvent);
    };

    events.forEach((eventName) => {
      document.addEventListener(eventName, listener, true);
    });

    return () => {
      events.forEach((eventName) => {
        document.removeEventListener(eventName, listener, true);
      });
    };
  }, [ref, enabled, events]);
}

// ---------------------------------------------------------------------------
// Usage example (for demonstration — remove or move to tests in production)
// ---------------------------------------------------------------------------

/*
import { useRef, useState } from 'react';
import { useClickOutside } from './2026-10-13-use-click-outside';

export function Example() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useClickOutside(boxRef, () => setVisible(false), { enabled: visible });

  return visible ? (
    <div ref={boxRef} style={{ padding: 20, border: '1px solid #ccc' }}>
      Click outside me to hide.
    </div>
  ) : null;
}
*/

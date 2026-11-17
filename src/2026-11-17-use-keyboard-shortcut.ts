/**
 * Custom React hook for registering keyboard shortcuts.
 *
 * Supports modifier keys (Ctrl, Shift, Alt, Meta) and works across platforms.
 * Automatically cleans up event listeners.
 *
 * @example
 * ```tsx
 * function SearchDialog() {
 *   const [open, setOpen] = useState(false);
 *
 *   useKeyboardShortcut({
 *     key: 'k',
 *     ctrl: true,
 *     onTrigger: () => setOpen(true),
 *   });
 *
 *   useKeyboardShortcut({
 *     key: 'Escape',
 *     onTrigger: () => setOpen(false),
 *     enabled: open,
 *   });
 *
 *   return open ? <div>Search...</div> : null;
 * }
 * ```
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutOptions {
  /** The key to listen for (e.g. 'k', 'Enter', 'Escape', 'ArrowDown') */
  key: string;
  /** Whether Ctrl (or Cmd on macOS) is required */
  ctrl?: boolean;
  /** Whether Shift is required */
  shift?: boolean;
  /** Whether Alt is required */
  alt?: boolean;
  /** Whether Meta (Windows key / Cmd) is required */
  meta?: boolean;
  /** Callback when the shortcut is triggered */
  onTrigger: (event: KeyboardEvent) => void;
  /** Whether the shortcut is active (default: true) */
  enabled?: boolean;
  /** Event target (default: window) */
  target?: Window | Document | HTMLElement | null;
  /** Prevent default browser behavior (default: true) */
  preventDefault?: boolean;
}

export function useKeyboardShortcut({
  key,
  ctrl = false,
  shift = false,
  alt = false,
  meta = false,
  onTrigger,
  enabled = true,
  target,
  preventDefault = true,
}: KeyboardShortcutOptions): void {
  const onTriggerRef = useCallback(onTrigger, [onTrigger]);

  useEffect(() => {
    if (!enabled) return;

    const element = target ?? window;

    const handler = (event: Event) => {
      const e = event as KeyboardEvent;

      // Normalize key for case-insensitive matching where appropriate
      const pressedKey = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const targetKey = key.length === 1 ? key.toLowerCase() : key;

      if (pressedKey !== targetKey) return;

      // Check modifiers. On macOS, meta often replaces ctrl for common shortcuts.
      const ctrlPressed = e.ctrlKey || e.metaKey;
      if (ctrl !== ctrlPressed && !(ctrl && e.metaKey)) return;
      if (shift !== e.shiftKey) return;
      if (alt !== e.altKey) return;
      if (meta !== e.metaKey) return;

      if (preventDefault) {
        e.preventDefault();
      }

      onTriggerRef(e);
    };

    element.addEventListener('keydown', handler);

    return () => {
      element.removeEventListener('keydown', handler);
    };
  }, [key, ctrl, shift, alt, meta, enabled, target, preventDefault, onTriggerRef]);
}

// Usage example:
// useKeyboardShortcut({
//   key: 's',
//   ctrl: true,
//   onTrigger: (e) => {
//     console.log('Save shortcut triggered');
//     // save logic
//   },
// });

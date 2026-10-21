/**
 * Custom React hook for attaching event listeners with automatic cleanup.
 * Supports window, document, or any EventTarget, with optional capture/passive options.
 *
 * @param eventName - Name of the event (e.g. 'click', 'keydown', 'resize')
 * @param handler - Event handler function
 * @param element - Target element (defaults to window). Can be a ref or direct element.
 * @param options - Optional addEventListener options
 *
 * @example
 * ```tsx
 * function KeyboardShortcuts() {
 *   useEventListener('keydown', (e: KeyboardEvent) => {
 *     if (e.key === 'Escape') closeModal();
 *   });
 *
 *   return <div>Press Escape to close</div>;
 * }
 * ```
 */
import { useEffect, useRef } from 'react';

type EventHandler<E extends Event = Event> = (event: E) => void;

interface UseEventListenerOptions extends AddEventListenerOptions {
  /** If true, attaches immediately even if element is null initially */
  immediate?: boolean;
}

export function useEventListener<
  K extends keyof WindowEventMap,
  E extends Event = WindowEventMap[K]
>(
  eventName: K,
  handler: EventHandler<E>,
  element: Window | Document | HTMLElement | null = typeof window !== 'undefined' ? window : null,
  options?: UseEventListenerOptions
): void {
  const savedHandler = useRef(handler);

  // Keep latest handler in ref to avoid re-binding
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element) return;

    const eventListener = (event: Event) => {
      savedHandler.current(event as E);
    };

    const opts = options ?? { passive: false };

    element.addEventListener(eventName, eventListener, opts);

    return () => {
      element.removeEventListener(eventName, eventListener, opts);
    };
  }, [eventName, element, options]);
}

// Usage example (uncomment in a React component):
//
// import { useRef } from 'react';
//
// function Demo() {
//   const buttonRef = useRef<HTMLButtonElement>(null);
//
//   useEventListener('click', () => {
//     console.log('Window clicked');
//   });
//
//   useEventListener(
//     'click',
//     (e) => {
//       console.log('Button clicked', e);
//     },
//     buttonRef.current
//   );
//
//   return <button ref={buttonRef}>Click me</button>;
// }

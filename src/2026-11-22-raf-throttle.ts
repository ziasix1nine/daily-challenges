/**
 * Creates a throttled function that runs at most once per animation frame.
 * Ideal for high-frequency events like scroll, resize, or mouse move
 * where you want to stay in sync with the browser's paint cycle.
 *
 * @param fn - The function to throttle.
 * @returns A throttled version of the function, plus a cancel method.
 *
 * @example
 * const onScroll = rafThrottle((event: Event) => {
 *   console.log('Scrolled to', window.scrollY);
 * });
 * window.addEventListener('scroll', onScroll);
 * // Later: onScroll.cancel();
 */

export function rafThrottle<T extends (...args: any[]) => void>(
  fn: T
): T & { cancel: () => void } {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = ((...args: Parameters<T>) => {
    lastArgs = args;

    if (rafId !== null) {
      return;
    }

    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (lastArgs) {
        fn(...lastArgs);
        lastArgs = null;
      }
    });
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    lastArgs = null;
  };

  return throttled;
}

// Usage example:
// const handleMouseMove = rafThrottle((e: MouseEvent) => {
//   console.log(e.clientX, e.clientY);
// });
// window.addEventListener('mousemove', handleMouseMove);
// // handleMouseMove.cancel();

import { useState, useEffect } from 'react';

/**
 * Custom React hook that tracks whether the browser window is currently focused.
 *
 * Useful for pausing animations, analytics, or reducing background work when the user
 * switches tabs or windows.
 *
 * @returns `true` if the window has focus, `false` otherwise.
 *
 * @example
 * function App() {
 *   const isFocused = useWindowFocus();
 *   return <div>Window is {isFocused ? 'focused' : 'blurred'}</div>;
 * }
 */
export function useWindowFocus(): boolean {
  const [isFocused, setIsFocused] = useState(() =>
    typeof document !== 'undefined' ? document.hasFocus() : true
  );

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Sync initial state in case it changed between render and effect
    setIsFocused(document.hasFocus());

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isFocused;
}

// Usage example (React component):
//
// import { useWindowFocus } from './2026-11-07-use-window-focus';
//
// function StatusIndicator() {
//   const focused = useWindowFocus();
//   return (
//     <p>
//       Document is currently {focused ? 'in focus' : 'in the background'}.
//     </p>
//   );
// }

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React hook to detect and toggle dark mode preference.
 * Respects system preference and allows manual override.
 * 
 * @returns Object with isDarkMode boolean and toggle function.
 * 
 * @example
 * const { isDarkMode, toggle } = useDarkMode();
 * return <button onClick={toggle}>{isDarkMode ? 'Light' : 'Dark'}</button>;
 */
export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('dark-mode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggle = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('dark-mode', String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      // Only update if no manual override in localStorage
      if (localStorage.getItem('dark-mode') === null) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return { isDarkMode, toggle };
}

// Usage example (in a React component)
/*
function ThemeToggle() {
  const { isDarkMode, toggle } = useDarkMode();
  return (
    <button onClick={toggle}>
      Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
    </button>
  );
}
*/

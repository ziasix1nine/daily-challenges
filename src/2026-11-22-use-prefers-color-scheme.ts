/**
 * Custom React hook to detect the user's preferred color scheme.
 * Listens to the `prefers-color-scheme` media query and updates reactively.
 *
 * @returns {'light' | 'dark'} The current preferred color scheme.
 *
 * @example
 * function ThemeAwareComponent() {
 *   const colorScheme = usePrefersColorScheme();
 *   return <div>Current preference: {colorScheme}</div>;
 * }
 */

import { useState, useEffect } from 'react';

type ColorScheme = 'light' | 'dark';

export function usePrefersColorScheme(): ColorScheme {
  const getPreference = (): ColorScheme => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  };

  const [colorScheme, setColorScheme] = useState<ColorScheme>(getPreference);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      setColorScheme(event.matches ? 'dark' : 'light');
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Legacy fallback
      mediaQuery.addListener(handleChange);
    }

    // Initial sync in case it changed between render and effect
    setColorScheme(mediaQuery.matches ? 'dark' : 'light');

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return colorScheme;
}

// Usage example (uncomment to test in a React component):
// const scheme = usePrefersColorScheme();
// console.log(scheme); // 'light' or 'dark'

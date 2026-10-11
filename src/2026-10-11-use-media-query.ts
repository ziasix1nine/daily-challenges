/**
 * React hook that tracks whether a CSS media query matches.
 *
 * @example
 * function ResponsiveNav() {
 *   const isMobile = useMediaQuery("(max-width: 768px)");
 *   return isMobile ? <MobileMenu /> : <DesktopMenu />;
 * }
 *
 * // With SSR-safe default
 * const prefersDark = useMediaQuery("(prefers-color-scheme: dark)", false);
 */

import { useCallback, useEffect, useState } from "react";

/**
 * Subscribe to a media query and return whether it currently matches.
 *
 * @param query - A valid CSS media query string, e.g. "(min-width: 1024px)"
 * @param defaultValue - Value returned during SSR or before the first match check (default: false)
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const getMatches = useCallback((): boolean => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  }, [query, defaultValue]);

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", listener);
    } else {
      // Legacy Safari < 14
      // @ts-expect-error - deprecated API
      mediaQueryList.addListener(listener);
    }

    // Sync in case the query changed
    setMatches(mediaQueryList.matches);

    return () => {
      if (typeof mediaQueryList.removeEventListener === "function") {
        mediaQueryList.removeEventListener("change", listener);
      } else {
        // @ts-expect-error - deprecated API
        mediaQueryList.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Convenience hooks for common breakpoints.
 * Adjust the pixel values to match your design system.
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)");
}

// Example:
// function ThemeToggle() {
//   const prefersDark = usePrefersDarkMode();
//   return <div>System prefers {prefersDark ? "dark" : "light"} mode</div>;
// }

/**
 * SSR-safe React hook that syncs state with localStorage.
 *
 * - Reads once on mount (avoids hydration mismatches by starting with the default).
 * - Accepts a value or an updater, like useState.
 * - Syncs across tabs via the "storage" event.
 * - remove() clears the key and resets to the default.
 *
 * Requires React 18+ types. This file is a utility module, not a component.
 */
import { useCallback, useEffect, useState } from "react";

export type StorageValue<T> = T | ((previous: T) => T);

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * @example
 * const [theme, setTheme, resetTheme] = useLocalStorage("theme", "system");
 * setTheme((current) => (current === "dark" ? "light" : "dark"));
 * resetTheme();
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (next: StorageValue<T>) => void, () => void] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    setValue(readStored(key, defaultValue));
  }, [key]);

  const setStored = useCallback(
    (next: StorageValue<T>) => {
      setValue((previous) => {
        const resolved =
          typeof next === "function"
            ? (next as (previous: T) => T)(previous)
            : next;
        writeStored(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
    setValue(defaultValue);
  }, [key, defaultValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function onStorage(event: StorageEvent): void {
      if (event.key !== key) return;
      setValue(event.newValue === null ? defaultValue : readStored(key, defaultValue));
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, defaultValue]);

  return [value, setStored, remove];
}

// --- usage example ---
// function ThemeToggle() {
//   const [theme, setTheme, resetTheme] = useLocalStorage<"light" | "dark">(
//     "theme",
//     "light",
//   );
//   return (
//     <button
//       type="button"
//       onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
//       onDoubleClick={resetTheme}
//     >
//       {theme}
//     </button>
//   );
// }

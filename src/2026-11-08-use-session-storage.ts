/**
 * Custom React hook for persisting state in sessionStorage.
 * Similar to useLocalStorage but scoped to the current browser session.
 *
 * @template T
 * @param {string} key - The sessionStorage key
 * @param {T} initialValue - Initial value if key is not present
 * @returns {[T, (value: T | ((prev: T) => T)) => void]} Tuple of [value, setValue]
 *
 * @example
 * const [user, setUser] = useSessionStorage('user', null);
 * setUser({ id: 1, name: 'Alice' });
 */
import { useState, useEffect, useCallback } from 'react';

export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Sync with other tabs/windows if needed (sessionStorage is tab-specific, but for completeness)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === window.sessionStorage) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, readValue]);

  return [storedValue, setValue];
}

// Usage example:
// function UserSession() {
//   const [theme, setTheme] = useSessionStorage('theme', 'light');
//   return (
//     <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
//       Current theme: {theme}
//     </button>
//   );
// }

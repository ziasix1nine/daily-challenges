/**
 * Custom React hook that returns a debounced version of a value.
 *
 * Useful for delaying expensive operations (search inputs, API calls, filters)
 * until the user has stopped typing or the value has settled.
 *
 * @template T
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default: 300)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchBox() {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebouncedValue(query, 400);
 *
 *   useEffect(() => {
 *     if (debouncedQuery) {
 *       // Perform search only after user stops typing
 *       search(debouncedQuery);
 *     }
 *   }, [debouncedQuery]);
 *
 *   return <input value={query} onChange={e => setQuery(e.target.value)} />;
 * }
 * ```
 */
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage example (uncomment to test in a React component)
/*
import { useState, useEffect } from 'react';

function Demo() {
  const [text, setText] = useState('');
  const debounced = useDebouncedValue(text, 500);

  useEffect(() => {
    console.log('Debounced value:', debounced);
  }, [debounced]);

  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Type to see debounce..."
    />
  );
}
*/

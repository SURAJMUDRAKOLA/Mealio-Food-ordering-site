import { useState, useEffect } from 'react';

/**
 * Debounces a value — only updates after `delay` ms of inactivity.
 * Prevents expensive re-filters on every keystroke.
 *
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 300);
 * // use debouncedSearch in useMemo — won't re-run until user pauses typing
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // Clean up timer if value changes before delay expires
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

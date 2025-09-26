import { useState, useEffect } from 'react';

/**
 * Custom hook để debounce value
 * @param value - Giá trị cần debounce
 * @param delay - Thời gian delay (ms), mặc định 300ms
 * @returns Giá trị đã được debounce
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * // debouncedSearchTerm sẽ chỉ update sau 500ms kể từ lần thay đổi cuối
 * ```
 */
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on component unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // ... within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}

export default useDebounce;
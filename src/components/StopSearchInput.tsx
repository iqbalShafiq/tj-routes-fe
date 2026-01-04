import { useState, useCallback, useRef, useEffect } from 'react';

interface StopSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  debounceMs?: number;
}

export function StopSearchInput({
  value,
  onChange,
  placeholder = 'Search stops by name, address, or facilities...',
  onClear,
  className = '',
  debounceMs = 300,
}: StopSearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced onChange
  const handleChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  const handleClear = () => {
    setInputValue('');
    onChange('');
    onClear?.();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-10 py-3
          border border-border bg-bg-surface
          text-text-primary placeholder:text-text-muted
          transition-all duration-200
          rounded-button
          focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent
          hover:border-border-strong
        "
        aria-label="Search stops"
      />

      {/* Clear Button */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Clear search"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

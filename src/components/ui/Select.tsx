import { useState, useRef, useEffect, forwardRef } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  error?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  borderless?: boolean;
  children?: React.ReactNode;
  options?: SelectOption[];
  searchable?: boolean;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({
    label,
    error,
    value,
    defaultValue,
    onChange,
    placeholder = 'Select an option',
    className = '',
    disabled = false,
    required = false,
    size = 'md',
    borderless = false,
    children,
    options: optionsProp,
    searchable = false
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | number | undefined>(value || defaultValue);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Parse options from children if options prop is not provided
    const allOptions: SelectOption[] = optionsProp || (() => {
      if (!children) return [];
      const childrenArray = Array.isArray(children) ? children : [children];
      return childrenArray
        .filter((child: any) => child?.type === 'option')
        .map((child: any) => ({
          value: child.props.value,
          label: child.props.children,
          disabled: child.props.disabled || false,
        }));
    })();

    // Filter options based on search term
    const options: SelectOption[] = searchable && searchTerm
      ? allOptions.filter(opt =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allOptions;

    // Update selected value when value prop changes
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    // Reset search term when dropdown closes
    useEffect(() => {
      if (!isOpen) {
        setSearchTerm('');
      }
    }, [isOpen]);

    // Focus search input when dropdown opens and searchable is enabled
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen) return;

        if (searchable && document.activeElement === searchInputRef.current) {
          if (event.key === 'Escape') {
            setIsOpen(false);
          }
          return;
        }

        if (event.key === 'Escape') {
          setIsOpen(false);
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          const enabledOptions = options.filter(opt => !opt.disabled);
          if (enabledOptions.length === 0) return;
          const currentIndex = enabledOptions.findIndex(opt => opt.value === selectedValue);
          const nextIndex = currentIndex < enabledOptions.length - 1 ? currentIndex + 1 : 0;
          const nextOption = enabledOptions[nextIndex];
          if (nextOption) {
            handleSelect(nextOption.value);
          }
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          const enabledOptions = options.filter(opt => !opt.disabled);
          if (enabledOptions.length === 0) return;
          const currentIndex = enabledOptions.findIndex(opt => opt.value === selectedValue);
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : enabledOptions.length - 1;
          const prevOption = enabledOptions[prevIndex];
          if (prevOption) {
            handleSelect(prevOption.value);
          }
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
      }
    }, [isOpen, selectedValue, options, searchable]);

    const handleSelect = (optionValue: string | number) => {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === selectedValue);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    // Size variants
    const sizeStyles = {
      xs: {
        button: 'px-2 py-1.5 text-sm',
        label: 'text-xs mb-1',
        icon: 'w-3.5 h-3.5',
        option: 'px-2 py-1.5 text-sm',
      },
      sm: {
        button: 'px-3 py-2 text-sm',
        label: 'text-xs mb-1',
        icon: 'w-4 h-4',
        option: 'px-3 py-2 text-xs',
      },
      md: {
        button: 'px-3 py-2 text-sm',
        label: 'text-sm mb-1.5',
        icon: 'w-4 h-4',
        option: 'px-3 py-2 text-sm',
      },
      lg: {
        button: 'px-4 py-3 text-base',
        label: 'text-base mb-1.5',
        icon: 'w-5 h-5',
        option: 'px-4 py-3 text-base',
      },
    };

    const currentSize = sizeStyles[size];

    return (
      <div className={`w-full ${className}`} ref={ref}>
        {label && (
          <label className={`block font-medium text-text-primary font-display ${currentSize.label}`}>
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <div className="relative" ref={selectRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              ${borderless
                ? 'w-full border-none bg-transparent shadow-none focus:ring-0 focus:outline-none'
                : `w-full px-3 py-2
                    border border-border bg-bg-surface
                    text-text-primary placeholder:text-text-tertiary
                    transition-all duration-200 rounded-button
                    focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent
                    hover:border-border-strong`
              }
              text-left
              flex items-center justify-between
              cursor-pointer
              ${!borderless ? currentSize.button : currentSize.button}
              ${error && !borderless ? 'border-error focus:border-error focus:ring-error/20' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${isOpen && !borderless ? 'ring-2 ring-accent-muted border-accent' : ''}
            `}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label={label || 'Select an option'}
          >
            <span className={`truncate ${!selectedOption ? 'text-text-tertiary' : 'text-text-primary'}`}>
              {displayText}
            </span>
            <svg
              className={`${currentSize.icon} text-text-secondary flex-shrink-0 ml-2 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-bg-surface border border-border rounded-lg shadow-elevated max-h-60 overflow-hidden flex flex-col dropdown-scrollbar"
              role="listbox"
            >
              {searchable && (
                <div className="p-2 border-b border-border sticky top-0 bg-bg-surface">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && options.length > 0) {
                        e.preventDefault();
                        const firstEnabled = options.find(opt => !opt.disabled);
                        if (firstEnabled) {
                          handleSelect(firstEnabled.value);
                        }
                      }
                    }}
                    placeholder="Search..."
                    className="w-full px-3 py-2 text-sm border border-border rounded-button bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent"
                  />
                </div>
              )}
              <div className="overflow-auto flex-1">
                {options.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-text-tertiary text-center">
                    {searchable && searchTerm ? 'No matching options' : 'No options available'}
                  </div>
                ) : (
                  options.map((option) => {
                    const isSelected = option.value === selectedValue;
                    const isDisabled = option.disabled;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => !isDisabled && handleSelect(option.value)}
                        disabled={isDisabled}
                        className={`
                          w-full text-left
                          transition-colors duration-150
                          first:rounded-t-lg last:rounded-b-lg
                          ${currentSize.option}
                          ${isSelected
                            ? 'bg-bg-hover text-text-primary font-medium'
                            : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                          }
                          ${isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                          }
                          focus:outline-none focus:bg-bg-hover
                        `}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          {isSelected && (
                            <svg
                              className={`${currentSize.icon} text-accent`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error font-body animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

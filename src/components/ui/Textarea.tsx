import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full flex items-center">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1.5 font-display">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            resize-none
            w-full px-3 py-2
            border border-border bg-bg-surface
            text-text-primary placeholder:text-text-muted
            transition-all duration-200 rounded-button
            focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent
            hover:border-border-strong
            ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-error font-body animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

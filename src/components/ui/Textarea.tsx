import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-2 font-display">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`input-refined resize-none ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 font-body animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';


import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className = '', icon, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 pl-10
            border border-border bg-bg-surface
            text-text-primary placeholder:text-text-muted
            transition-all duration-200
            rounded-button
            focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent
            hover:border-border-strong
            ${className}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    );
  }
);

InputWithIcon.displayName = 'InputWithIcon';

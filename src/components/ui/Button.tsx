import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'font-display font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed active:scale-[0.98] inline-flex items-center justify-center rounded-button';

    const variants = {
      primary: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent disabled:bg-accent/50 disabled:text-white/70',
      secondary: 'bg-bg-surface text-text-primary border border-border hover:bg-bg-elevated focus:ring-border disabled:opacity-50',
      outline: 'bg-transparent border border-border text-text-primary hover:bg-bg-elevated focus:ring-border disabled:opacity-50',
      danger: 'bg-error text-white hover:bg-red-700 focus:ring-error disabled:bg-error/50 disabled:text-white/70',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

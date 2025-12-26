import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'font-display font-medium button-minimal transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] inline-flex items-center justify-center';
    
    const variants = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500',
      accent: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
      secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500',
      outline: 'bg-transparent border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
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

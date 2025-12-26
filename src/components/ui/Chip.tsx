import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-slate-100 text-slate-700',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
};

const sizeStyles = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

export function Chip({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: ChipProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium border border-transparent
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

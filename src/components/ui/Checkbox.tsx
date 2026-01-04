import type { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = ({ label, className = '', ...props }: CheckboxProps) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-border text-accent focus:ring-accent focus:ring-offset-0"
        {...props}
      />
      {label && (
        <span className="text-sm text-text-secondary">{label}</span>
      )}
    </label>
  );
};

import { InputHTMLAttributes, forwardRef } from 'react';

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  accept?: string;
  multiple?: boolean;
  onFileChange?: (files: FileList | null) => void;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ className = '', label, error, accept, multiple, onFileChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onFileChange) {
        onFileChange(e.target.files);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-2 font-display">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            className={`
              input-refined
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-amber-500 file:text-white
              file:hover:bg-amber-600
              file:cursor-pointer
              file:transition-colors
              cursor-pointer
              ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 font-body animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';


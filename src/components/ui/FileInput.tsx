import { InputHTMLAttributes, forwardRef } from 'react';
import { Button } from './Button';

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  accept?: string;
  multiple?: boolean;
  onFileChange?: (files: FileList | null) => void;
  buttonSize?: 'sm' | 'md' | 'lg';
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ className = '', label, error, accept, multiple, onFileChange, onChange, buttonSize = 'sm', ...props }, ref) => {
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
        <div className="flex items-center gap-3 w-full px-4 py-3 border-2 border-slate-200 bg-white transition-all duration-200 hover:border-slate-300">
          <input
            ref={ref}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            id="file-upload"
            className="sr-only"
            {...props}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-block"
          >
            <Button variant="accent" size={buttonSize}>
              Choose File
            </Button>
          </label>
          <span className="text-sm text-slate-500">
            {props.value ? String(props.value).split('\\').pop() || 'No file chosen' : 'No file chosen'}
          </span>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 font-body animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';


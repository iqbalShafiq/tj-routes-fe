import { useState, useRef, useId, type InputHTMLAttributes, forwardRef } from 'react';
import { Button } from './Button';

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  accept?: string;
  multiple?: boolean;
  onFileChange?: (files: FileList | null) => void;
  buttonSize?: 'sm' | 'md' | 'lg';
  id?: string;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ className = '', label, error, accept, multiple, onFileChange, onChange, buttonSize = 'sm', id: providedId, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const resolvedRef = ref || internalRef;
    const generatedId = useId();
    const inputId = providedId || `file-upload-${generatedId}`;
    const [fileNames, setFileNames] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (onFileChange) {
        onFileChange(files);
      }
      if (onChange) {
        onChange(e);
      }
      // Update file names display
      if (files && files.length > 0) {
        const names = Array.from(files).map(f => f.name).join(', ');
        setFileNames(names);
      } else {
        setFileNames('');
      }
    };

    const handleButtonClick = () => {
      resolvedRef.current?.click();
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1.5 font-display">
            {label}
          </label>
        )}
        <div className="flex items-center gap-3 w-full px-3 py-2 border border-border bg-bg-surface rounded-button transition-all duration-200 hover:border-border-strong">
          <input
            ref={resolvedRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            id={inputId}
            className="sr-only"
            {...props}
          />
          <Button
            variant="primary"
            size={buttonSize}
            type="button"
            onClick={handleButtonClick}
          >
            Choose File
          </Button>
          <span className="text-sm text-text-muted truncate max-w-[200px]">
            {fileNames || 'No file chosen'}
          </span>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error font-body animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';

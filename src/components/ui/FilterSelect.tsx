import { Select } from './Select';

interface FilterSelectProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: Array<{ value: string | number; label: string }>;
  className?: string;
}

export const FilterSelect = ({ label, value, onChange, options, className = '' }: FilterSelectProps) => {
  return (
    <div className={`flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 ${className}`}>
      <span className="text-sm text-slate-600 whitespace-nowrap">{label}:</span>
      <Select
        value={value}
        onChange={onChange}
        size="xs"
        borderless
        className="w-auto min-w-[100px]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
};


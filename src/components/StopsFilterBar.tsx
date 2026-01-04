import { Select } from './ui/Select';

interface StopsFilterBarProps {
  typeFilter: 'all' | 'stop' | 'terminal';
  onTypeFilterChange: (value: 'all' | 'stop' | 'terminal') => void;
  facilityFilter: string | null;
  onFacilityFilterChange: (value: string | null) => void;
  allFacilities: string[];
  className?: string;
}

export function StopsFilterBar({
  typeFilter,
  onTypeFilterChange,
  facilityFilter,
  onFacilityFilterChange,
  allFacilities,
  className = '',
}: StopsFilterBarProps) {
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'stop', label: 'Stop' },
    { value: 'terminal', label: 'Terminal' },
  ];

  const facilityOptions = [
    { value: '', label: 'All Facilities' },
    ...allFacilities.map((facility) => ({
      value: facility,
      label: facility,
    })),
  ];

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <div className="w-full sm:w-36">
        <Select
          size="sm"
          value={typeFilter}
          onChange={(val) => onTypeFilterChange(val as 'all' | 'stop' | 'terminal')}
          options={typeOptions}
          borderless
        />
      </div>

      {allFacilities.length > 0 && (
        <div className="flex-1 min-w-[150px]">
          <Select
            size="sm"
            value={facilityFilter || ''}
            onChange={(val) => onFacilityFilterChange(val === '' ? null : val as string)}
            options={facilityOptions}
            searchable
            borderless
          />
        </div>
      )}

      {/* Active filters indicator */}
      {(typeFilter !== 'all' || facilityFilter !== null) && (
        <button
          type="button"
          onClick={() => {
            onTypeFilterChange('all');
            onFacilityFilterChange(null);
          }}
          className="text-xs text-text-muted hover:text-text-primary transition-colors self-center"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

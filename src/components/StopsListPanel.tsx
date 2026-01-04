import type { Stop } from '../lib/api/stops';
import { StopSearchInput } from './StopSearchInput';
import { StopsFilterBar } from './StopsFilterBar';
import { StopListItem } from './StopListItem';

interface StopsListPanelProps {
  stops: Stop[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: 'all' | 'stop' | 'terminal';
  onTypeFilterChange: (value: 'all' | 'stop' | 'terminal') => void;
  facilityFilter: string | null;
  onFacilityFilterChange: (value: string | null) => void;
  allFacilities: string[];
  hoveredStopId: number | null;
  onHoverStopIdChange: (stopId: number | null) => void;
  focusedStopId: number | null;
  onFocusedStopIdChange: (stopId: number | null) => void;
  expandedStopId: number | null;
  onExpandedStopIdChange: (stopId: number | null) => void;
  className?: string;
}

export function StopsListPanel({
  stops,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  facilityFilter,
  onFacilityFilterChange,
  allFacilities,
  hoveredStopId,
  onHoverStopIdChange,
  focusedStopId,
  onFocusedStopIdChange,
  expandedStopId,
  onExpandedStopIdChange,
  className = '',
}: StopsListPanelProps) {
  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleFocus = (stop: Stop) => {
    onFocusedStopIdChange(stop.id === focusedStopId ? null : stop.id);
    if (stop.id !== focusedStopId) {
      onExpandedStopIdChange(stop.id);
    }
  };

  const handleToggleExpand = (stopId: number) => {
    onExpandedStopIdChange(expandedStopId === stopId ? null : stopId);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-surface">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-bold text-text-primary">
            Route Stops
          </h2>
          <span className="text-sm text-text-muted">
            {stops.length} {stops.length === 1 ? 'stop' : 'stops'}
          </span>
        </div>

        {/* Search */}
        <StopSearchInput
          value={searchQuery}
          onChange={onSearchChange}
          onClear={handleClearSearch}
        />

        {/* Filters */}
        <div className="mt-3">
          <StopsFilterBar
            typeFilter={typeFilter}
            onTypeFilterChange={onTypeFilterChange}
            facilityFilter={facilityFilter}
            onFacilityFilterChange={onFacilityFilterChange}
            allFacilities={allFacilities}
          />
        </div>
      </div>

      {/* Stops List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {stops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="w-12 h-12 text-text-muted mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-text-secondary font-medium">No stops found</p>
            <p className="text-sm text-text-muted mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          stops.map((stop, index) => (
            <StopListItem
              key={stop.id}
              stop={stop}
              sequenceNumber={index + 1}
              isHighlighted={stop.id === hoveredStopId}
              isFocused={stop.id === focusedStopId}
              isExpanded={stop.id === expandedStopId}
              onHover={onHoverStopIdChange}
              onFocus={handleFocus}
              onToggleExpand={handleToggleExpand}
            />
          ))
        )}
      </div>
    </div>
  );
}

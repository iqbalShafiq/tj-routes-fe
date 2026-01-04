import { useState, useRef, useEffect, useCallback } from 'react';
import type { Stop } from '../lib/api/stops';
import { StopSearchInput } from './StopSearchInput';
import { StopsFilterBar } from './StopsFilterBar';
import { StopListItem } from './StopListItem';

interface MobileStopsDrawerProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
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
}

export function MobileStopsDrawer({
  isExpanded,
  onToggleExpand,
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
}: MobileStopsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleFocus = (stop: Stop) => {
    onFocusedStopIdChange(stop.id === focusedStopId ? null : stop.id);
    if (stop.id !== focusedStopId) {
      onExpandedStopIdChange(stop.id);
    }
  };

  const handleToggleExpandLocal = (stopId: number) => {
    onExpandedStopIdChange(expandedStopId === stopId ? null : stopId);
  };

  // Touch handlers for drag to expand
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isExpanded) return;
    const touch = e.touches[0];
    startY.current = touch.clientY;
    currentY.current = touch.clientY;
    setIsDragging(true);
  }, [isExpanded]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    currentY.current = touch.clientY;
    const diff = startY.current - currentY.current;

    // Only allow dragging up (expanding)
    if (diff > 0) {
      const drawer = drawerRef.current;
      if (drawer) {
        drawer.style.transform = `translateY(${Math.min(diff, 20)}px)`;
      }
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const drawer = drawerRef.current;
    if (drawer) {
      drawer.style.transform = '';
    }

    const diff = startY.current - currentY.current;
    // If dragged up more than 50px, expand; otherwise collapse
    if (diff > 50 && !isExpanded) {
      onToggleExpand();
    } else if (diff < -50 && isExpanded) {
      onToggleExpand();
    }
  }, [isDragging, isExpanded, onToggleExpand]);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        onToggleExpand();
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isExpanded, onToggleExpand]);

  return (
    <div
      ref={drawerRef}
      className={`
        fixed bottom-0 left-0 right-0 z-[60]
        bg-bg-surface rounded-t-2xl shadow-elevated
        transition-transform duration-300 ease-out
        transform
        ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}
        ${isExpanded ? 'max-h-[70vh]' : 'max-h-[100px]'}
        pb-safe
      `}
      style={{
        maxHeight: isExpanded ? '70vh' : '100px',
      }}
    >
      {/* Drag Handle / Header */}
      <div
        className="flex flex-col cursor-grab active:cursor-grabbing touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle indicator */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-bg-elevated rounded-full" />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-display font-bold text-text-primary">
              Stops
            </h2>
            <span className="text-sm text-text-muted bg-bg-elevated px-2 py-0.5 rounded-full">
              {stops.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleExpand}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
            aria-label={isExpanded ? 'Collapse stops' : 'Expand stops'}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 overflow-hidden flex flex-col animate-fade-in">
          {/* Search */}
          <StopSearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onClear={handleClearSearch}
            className="mb-3"
          />

          {/* Filters */}
          <StopsFilterBar
            typeFilter={typeFilter}
            onTypeFilterChange={onTypeFilterChange}
            facilityFilter={facilityFilter}
            onFacilityFilterChange={onFacilityFilterChange}
            allFacilities={allFacilities}
            className="mb-3"
          />

          {/* Stops List */}
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pb-4">
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
                  onToggleExpand={handleToggleExpandLocal}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

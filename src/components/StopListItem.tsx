import type { Stop } from '../lib/api/stops';
import { Chip } from './ui/Chip';

interface StopListItemProps {
  stop: Stop;
  sequenceNumber: number;
  isHighlighted: boolean;
  isFocused: boolean;
  isExpanded: boolean;
  onHover: (stopId: number) => void;
  onFocus: (stop: Stop) => void;
  onToggleExpand: (stopId: number) => void;
  className?: string;
}

// Helper to normalize facilities to array
function getFacilitiesArray(facilities: string | string[] | undefined): string[] {
  if (!facilities) return [];
  if (Array.isArray(facilities)) return facilities;
  try {
    return JSON.parse(facilities);
  } catch {
    return [];
  }
}

export function StopListItem({
  stop,
  sequenceNumber,
  isHighlighted,
  isFocused,
  isExpanded,
  onHover,
  onFocus,
  onToggleExpand,
  className = '',
}: StopListItemProps) {
  const facilities = getFacilitiesArray(stop.facilities);
  const fullAddress = [
    stop.address,
    stop.district,
    stop.city,
  ].filter(Boolean).join(', ');

  return (
    <div
      className={`
        group relative flex items-start gap-4 p-4
        border rounded-card transition-all duration-200
        cursor-pointer
        ${isFocused
          ? 'border-accent bg-accent/5 shadow-md'
          : isHighlighted
            ? 'border-tertiary bg-tertiary/5'
            : 'border-border bg-bg-surface hover:border-tertiary/50 hover:bg-bg-elevated'
        }
        ${className}
      `}
      onMouseEnter={() => onHover(stop.id)}
      onMouseLeave={() => onHover(0)}
      onClick={() => onFocus(stop)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFocus(stop);
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isFocused}
      aria-expanded={isExpanded}
    >
      {/* Sequence Number Circle */}
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          font-display font-bold text-sm transition-all duration-200
          ${isFocused
            ? 'bg-accent text-white shadow-lg'
            : 'bg-accent text-white'
          }
        `}
      >
        {sequenceNumber}
      </div>

      {/* Stop Info */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className={`
              font-display font-semibold transition-colors
              ${isFocused ? 'text-accent' : 'text-text-primary'}
            `}>
              {stop.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Chip
                variant={stop.type === 'terminal' ? 'warning' : 'default'}
                size="sm"
              >
                {stop.type === 'terminal' ? 'Terminal' : 'Stop'}
              </Chip>
              {stop.status === 'inactive' && (
                <Chip variant="error" size="sm">
                  Inactive
                </Chip>
              )}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(stop.id);
            }}
            className={`
              p-1.5 rounded-lg transition-all duration-200
              text-text-muted hover:text-text-primary hover:bg-bg-elevated
              ${isExpanded ? 'rotate-180' : ''}
            `}
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            <svg
              className="w-5 h-5"
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

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border animate-fade-in">
            {/* Address */}
            {fullAddress && (
              <div className="flex items-start gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm text-text-secondary">{fullAddress}</span>
              </div>
            )}

            {/* Facilities */}
            {facilities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {facilities.map((facility, index) => (
                  <Chip key={index} variant="info" size="sm">
                    {facility}
                  </Chip>
                ))}
              </div>
            )}

            {/* Photo */}
            {stop.photo_url && (
              <div className="mt-3">
                <img
                  src={stop.photo_url}
                  alt={`Photo of ${stop.name}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

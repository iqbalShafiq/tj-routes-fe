import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { format, formatDistanceToNow } from 'date-fns';
import type { CheckIn } from '../lib/api/checkin';

interface CheckInHistoryCardProps {
  checkIn: CheckIn;
}

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '--';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const getStatusVariant = (status: string): 'warning' | 'success' | 'default' => {
  switch (status) {
    case 'in_progress': return 'warning';
    case 'completed': return 'success';
    case 'cancelled': return 'default';
    default: return 'default';
  }
};

export const CheckInHistoryCard = ({ checkIn }: CheckInHistoryCardProps) => {
  const statusLabel = checkIn.status === 'in_progress' ? 'In Progress' : checkIn.status;

  return (
    <Card size="sm" className="hover:shadow-md transition-shadow p-4">
      <div className="flex items-start gap-4">
        {/* Route info */}
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
          ${checkIn.status === 'in_progress' ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent'}
        `}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          {/* Route and status */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-display font-semibold text-text-primary">
                {checkIn.route ? (
                  <span className="text-accent">{checkIn.route.route_number}</span>
                ) : (
                  'Route'
                )}
                <span className="text-text-secondary ml-2 text-sm font-normal">
                  {checkIn.route?.name || 'Unknown Route'}
                </span>
              </h3>
              <Chip
                variant={getStatusVariant(checkIn.status)}
                size="sm"
              >
                {statusLabel}
              </Chip>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-accent">
                +{checkIn.points_earned} pts
              </p>
            </div>
          </div>

          {/* Journey info */}
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="truncate max-w-[120px]">
                {checkIn.start_stop?.name || 'Start'}
              </span>
            </div>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            {checkIn.end_stop ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-error" />
                <span className="truncate max-w-[120px]">
                  {checkIn.end_stop.name}
                </span>
              </div>
            ) : (
              <span className="text-text-muted italic">In Progress...</span>
            )}
          </div>

          {/* Time and duration */}
          <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {format(new Date(checkIn.start_time), 'MMM d, yyyy • h:mm a')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {checkIn.duration_seconds && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDuration(checkIn.duration_seconds)}
                </span>
              )}
              <span>
                {formatDistanceToNow(new Date(checkIn.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

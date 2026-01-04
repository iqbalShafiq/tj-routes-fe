import { Link } from '@tanstack/react-router';
import type { UserSavedNavigation } from '../lib/api/personalized';
import { Card } from './ui/Card';
import { formatDistanceToNow } from 'date-fns';
import { PlaceTypeIcon } from './PlaceTypeIcon';

interface SavedNavigationCardProps {
  navigation: UserSavedNavigation;
  onEdit?: (navigation: UserSavedNavigation) => void;
  onDelete?: (navigation: UserSavedNavigation) => void;
  onNavigate?: (navigation: UserSavedNavigation) => void;
}

export const SavedNavigationCard = ({
  navigation,
  onEdit,
  onDelete,
  onNavigate,
}: SavedNavigationCardProps) => {
  const formatPoint = (point: { place_type?: string; place_name?: string; stop_name?: string }) => {
    if (point.place_name) return point.place_name;
    if (point.stop_name) return point.stop_name;
    if (point.place_type) return point.place_type;
    return 'Unknown';
  };

  const formatPointType = (point: { place_type?: string }) => {
    return point.place_type || 'stop';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200" size="md">
      <div className="flex items-start gap-4">
        {/* Navigation Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-info/10 flex items-center justify-center text-info">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-lg font-display font-semibold text-text-primary truncate">
                {navigation.name}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Updated {formatDistanceToNow(new Date(navigation.updated_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-3 mt-3">
            <div className="w-fit min-w-0">
              <div className="flex items-center gap-2">
                <PlaceTypeIcon
                  placeType={formatPointType(navigation.from)}
                  className="w-4 h-4 text-text-muted flex-shrink-0"
                />
                <span className="text-sm text-text-secondary truncate">
                  {formatPoint(navigation.from)}
                </span>
              </div>
            </div>

            <svg
              className="w-5 h-5 text-text-muted flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>

            <div className="w-fit min-w-0">
              <div className="flex items-center gap-2">
                <PlaceTypeIcon
                  placeType={formatPointType(navigation.to)}
                  className="w-4 h-4 text-text-muted flex-shrink-0"
                />
                <span className="text-sm text-text-secondary truncate">
                  {formatPoint(navigation.to)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onNavigate && (
            <button
              onClick={() => onNavigate(navigation)}
              className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
              title="Navigate"
            >
              <svg
                className="w-5 h-5 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(navigation)}
              className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
              title="Edit"
            >
              <svg
                className="w-5 h-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(navigation)}
              className="p-2 hover:bg-error/10 rounded-lg transition-colors"
              title="Delete"
            >
              <svg
                className="w-5 h-5 text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

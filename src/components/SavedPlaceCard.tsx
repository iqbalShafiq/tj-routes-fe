import { Link } from '@tanstack/react-router';
import type { UserPlace } from '../lib/api/personalized';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { PlaceTypeIcon, getPlaceTypeLabel } from './PlaceTypeIcon';

interface SavedPlaceCardProps {
  place: UserPlace;
  onEdit?: (place: UserPlace) => void;
  onDelete?: (place: UserPlace) => void;
  onSetDefault?: (place: UserPlace) => void;
  onShowOnMap?: (place: UserPlace) => void;
}

export const SavedPlaceCard = ({
  place,
  onEdit,
  onDelete,
  onSetDefault,
  onShowOnMap,
}: SavedPlaceCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200" size="md">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <PlaceTypeIcon placeType={place.place_type} className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-lg font-display font-semibold text-text-primary truncate">
                {place.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Chip variant="default" size="sm">
                  {getPlaceTypeLabel(place.place_type)}
                </Chip>
                {place.is_default && (
                  <Chip variant="success" size="sm">
                    Default
                  </Chip>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          {place.address && (
            <p className="text-sm text-text-secondary mt-2 line-clamp-1">
              {place.address}
            </p>
          )}

          {/* Notes */}
          {place.notes && (
            <p className="text-sm text-text-muted mt-1 line-clamp-2">
              {place.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onShowOnMap && (
            <button
              onClick={() => onShowOnMap(place)}
              className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
              title="Show on map"
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
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </button>
          )}
          {!place.is_default && onSetDefault && (
            <button
              onClick={() => onSetDefault(place)}
              className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
              title="Set as default"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(place)}
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
              onClick={() => onDelete(place)}
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

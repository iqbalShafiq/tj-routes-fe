import { useCallback } from 'react';
import { useToggleFavoriteRoute, useToggleFavoriteStop } from '../lib/hooks/usePersonalized';

interface FavoriteButtonProps {
  id: number;
  type: 'route' | 'stop';
  isFavorite: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'minimal';
}

export const FavoriteButton = ({
  id,
  type,
  isFavorite,
  size = 'md',
  showText = false,
  variant = 'default',
}: FavoriteButtonProps) => {
  const toggleRouteMutation = useToggleFavoriteRoute();
  const toggleStopMutation = useToggleFavoriteStop();

  const mutation = type === 'route' ? toggleRouteMutation : toggleStopMutation;
  const isPending = mutation.isPending;

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    if (type === 'route') {
      toggleRouteMutation.mutate({ routeId: id, isFavorite });
    } else {
      toggleStopMutation.mutate({ stopId: id, isFavorite });
    }
  }, [id, type, isFavorite, isPending, toggleRouteMutation, toggleStopMutation]);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const getButtonClasses = () => {
    if (variant === 'minimal') {
      return `
        inline-flex items-center justify-center transition-all duration-200
        ${isFavorite
          ? 'text-accent'
          : 'text-text-muted hover:text-accent'
        }
        ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
      `;
    }
    return `
      inline-flex items-center justify-center rounded-full transition-all duration-200
      ${isFavorite
        ? 'bg-accent text-white'
        : 'bg-bg-elevated text-text-muted hover:bg-bg-hover hover:text-accent'
      }
      ${sizeClasses[size]}
      ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={getButtonClasses()}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={iconSizeClasses[size]}
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showText && (
        <span className="ml-1.5 text-sm font-medium">
          {isFavorite ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

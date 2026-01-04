import { useState, useCallback } from 'react';
import { useToggleFavoriteRoute, useToggleFavoriteStop } from '../lib/hooks/usePersonalized';
import { Loading } from './ui/Loading';

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
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite);

  const toggleRouteMutation = useToggleFavoriteRoute();
  const toggleStopMutation = useToggleFavoriteStop();

  const mutation = type === 'route' ? toggleRouteMutation : toggleStopMutation;
  const isLoading = mutation.isPending;

  const handleToggle = useCallback(async () => {
    if (isLoading) return;

    const newState = !optimisticFavorite;
    setOptimisticFavorite(newState);

    try {
      if (type === 'route') {
        await toggleRouteMutation.mutateAsync({ routeId: id, isFavorite: optimisticFavorite });
      } else {
        await toggleStopMutation.mutateAsync({ stopId: id, isFavorite: optimisticFavorite });
      }
    } catch {
      // Revert on error
      setOptimisticFavorite(!newState);
    }
  }, [id, type, optimisticFavorite, isLoading, toggleRouteMutation, toggleStopMutation]);

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
        ${optimisticFavorite
          ? 'text-accent'
          : 'text-text-muted hover:text-accent'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `;
    }
    return `
      inline-flex items-center justify-center rounded-full transition-all duration-200
      ${optimisticFavorite
        ? 'bg-accent text-white'
        : 'bg-bg-elevated text-text-muted hover:bg-bg-hover hover:text-accent'
      }
      ${sizeClasses[size]}
      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={getButtonClasses()}
      title={optimisticFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <Loading size="sm" />
      ) : (
        <svg
          className={iconSizeClasses[size]}
          fill={optimisticFavorite ? 'currentColor' : 'none'}
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
      )}
      {showText && (
        <span className="ml-1.5 text-sm font-medium">
          {optimisticFavorite ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

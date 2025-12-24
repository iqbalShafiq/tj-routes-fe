import { useFollowUser, useUnfollowUser } from '../lib/hooks/useFollowUser';
import { useFollowStatus } from '../lib/hooks/useFollowStatus';
import { useAuth } from '../lib/hooks/useAuth';
import { Button } from './ui/Button';

interface FollowButtonProps {
  userId: number;
  className?: string;
  variant?: 'default' | 'minimal';
}

export const FollowButton = ({ userId, className, variant = 'default' }: FollowButtonProps) => {
  const { isAuthenticated, user } = useAuth();
  const { data: isFollowing } = useFollowStatus(userId, isAuthenticated);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Don't show follow button for own profile
  if (!isAuthenticated || user?.id === userId) {
    return null;
  }

  const handleToggleFollow = () => {
    if (isFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={isLoading}
        className={`text-sm font-medium transition-colors ${
          isFollowing
            ? 'text-slate-600 hover:text-red-600'
            : 'text-amber-600 hover:text-amber-700'
        } disabled:opacity-50 ${className || ''}`}
      >
        {isLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isLoading}
      variant={isFollowing ? 'outline' : 'accent'}
      size="sm"
      className={className}
    >
      {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};


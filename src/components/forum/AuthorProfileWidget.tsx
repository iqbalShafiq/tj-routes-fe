import { useUser } from '../../lib/hooks/useUsers';
import { useAuth } from '../../lib/hooks/useAuth';
import { Skeleton } from '../ui/Loading';
import { Card } from '../ui/Card';
import { FollowButton } from '../FollowButton';
import { useNavigate } from '@tanstack/react-router';

const getLevelColor = (level: string) => {
  switch (level) {
    case 'newcomer':
      return 'bg-slate-100 text-slate-700';
    case 'contributor':
      return 'bg-blue-100 text-blue-700';
    case 'trusted':
      return 'bg-green-100 text-green-700';
    case 'expert':
      return 'bg-purple-100 text-purple-700';
    case 'legend':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-bg-elevated text-text-secondary';
  }
};

interface AuthorProfileWidgetProps {
  userId: number;
}

export const AuthorProfileWidget = ({ userId }: AuthorProfileWidgetProps) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: author, isLoading: loadingAuthor } = useUser(userId);

  const handleUserClick = () => {
    navigate({ to: '/profile/$userId', params: { userId: userId.toString() } });
  };

  if (loadingAuthor) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Author</h3>
        </div>
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </Card>
    );
  }

  if (!author) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Author</h3>
        </div>
        <div className="text-center py-4 text-text-muted text-sm">
          User not found
        </div>
      </Card>
    );
  }

  const isCurrentUser = currentUser?.id === userId;

  return (
    <Card size="sm">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-text-primary">Author</h3>
      </div>

      <div className="flex items-start gap-3">
        <button
          onClick={handleUserClick}
          className="flex-shrink-0"
        >
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center overflow-hidden">
            {author.oauth_provider ? (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(author.username)}&background=random`}
                alt={author.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {author.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </button>

        <div className="flex-1 min-w-0">
          <button
            onClick={handleUserClick}
            className="flex flex-col items-start hover:opacity-80 transition-opacity w-full"
          >
            <span className="font-medium text-text-primary truncate w-full text-left">{author.username}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-flex ${getLevelColor(author.level || 'newcomer')}`}>
              {author.level || 'newcomer'}
            </span>
          </button>
        </div>

        {!isCurrentUser && <FollowButton userId={userId} variant="minimal" />}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Reputation</span>
          <span className="font-medium text-text-primary">{author.reputation_points || 0}</span>
        </div>
      </div>
    </Card>
  );
};

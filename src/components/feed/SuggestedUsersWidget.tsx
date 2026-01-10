import { useSuggestedUsers } from '../../lib/hooks/useSuggestedUsers';
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

export const SuggestedUsersWidget = () => {
  const navigate = useNavigate();
  const { data: users, isLoading, error } = useSuggestedUsers(5);

  const handleUserClick = (userId: number) => {
    navigate({ to: '/profile/$userId', params: { userId: userId.toString() } });
  };

  if (isLoading) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Suggested Users</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Suggested Users</h3>
        </div>
        <div className="text-center py-6 text-error text-sm">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Failed to load suggestions</p>
        </div>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Suggested Users</h3>
        </div>
        <div className="text-center py-6 text-text-muted text-sm">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p>No suggestions available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card size="sm">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-text-primary">Suggested Users</h3>
      </div>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-bg-elevated transition-colors cursor-pointer"
          >
            <button
              onClick={() => handleUserClick(user.id)}
              className="flex-shrink-0 relative"
            >
              <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center overflow-hidden">
                {user.oauth_provider ? (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-text-secondary font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => handleUserClick(user.id)}
                className="flex flex-col items-start w-full hover:opacity-80 transition-opacity"
              >
                <span className="font-medium text-text-primary truncate w-full">{user.username}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${getLevelColor(user.level || 'newcomer')}`}>
                  {user.level || 'newcomer'}
                </span>
              </button>
            </div>
            <FollowButton userId={user.id} variant="minimal" />
          </div>
        ))}
      </div>
    </Card>
  );
};

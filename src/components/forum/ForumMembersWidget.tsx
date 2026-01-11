import { useNavigate } from '@tanstack/react-router';
import { useForumMembers } from '../../lib/hooks/useForums';
import { Skeleton } from '../ui/Loading';
import { Card } from '../ui/Card';

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

interface ForumMembersWidgetProps {
  forumId: number;
  limit?: number;
}

export const ForumMembersWidget = ({ forumId, limit = 5 }: ForumMembersWidgetProps) => {
  const navigate = useNavigate();
  const { data: membersData, isLoading, error } = useForumMembers(forumId, 1, limit);

  const handleUserClick = (userId: number) => {
    navigate({ to: '/profile/$userId', params: { userId: userId.toString() } });
  };

  if (isLoading) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Top Contributors</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16 mt-1" />
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
          <h3 className="font-display font-semibold text-text-primary">Top Contributors</h3>
        </div>
        <div className="text-center py-6 text-error text-sm">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Failed to load members</p>
        </div>
      </Card>
    );
  }

  if (!membersData || membersData.data.length === 0) {
    return (
      <Card size="sm">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-text-primary">Top Contributors</h3>
        </div>
        <div className="text-center py-6 text-text-muted text-sm">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>No members yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card size="sm">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-text-primary">Top Contributors</h3>
      </div>
      <div className="space-y-3">
        {membersData.data.slice(0, limit).map((member) => (
          <button
            key={member.id}
            onClick={() => handleUserClick(member.user.id)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center overflow-hidden flex-shrink-0">
              {member.user.oauth_provider ? (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.username)}&background=random`}
                  alt={member.user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold">
                  {member.user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-text-primary truncate">{member.user.username}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full inline-flex ${getLevelColor(member.user.level || 'newcomer')}`}>
                {member.user.level || 'newcomer'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};

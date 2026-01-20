import { Link } from '@tanstack/react-router';
import { useConversation, useGroup } from '../../lib/hooks/useChat';
import { Button } from '../ui/Button';

interface UserInfoPanelProps {
  type: 'conversation' | 'group';
  id: number;
}

export function UserInfoPanel({ type, id }: UserInfoPanelProps) {
  if (type === 'conversation') {
    return <ConversationInfo conversationId={id} />;
  }
  return <GroupInfo groupId={id} />;
}

function ConversationInfo({ conversationId }: { conversationId: number }) {
  const { data: conversation, isLoading } = useConversation(conversationId);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-text-muted">No conversation found</div>
      </div>
    );
  }

  const otherParticipant = conversation.participants?.find(p => p.user);
  const user = otherParticipant?.user;

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-text-muted">User not found</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg-surface overflow-y-auto">
      {/* User header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold overflow-hidden mb-4">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user.username?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-1">{user.username}</h2>
          {user.level && (
            <span className="text-sm text-accent font-medium capitalize mb-2">
              {user.level.replace('_', ' ')}
            </span>
          )}
          {user.reputation_points !== undefined && (
            <div className="flex items-center gap-1 text-text-secondary text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{user.reputation_points} points</span>
            </div>
          )}
        </div>
      </div>

      {/* User details */}
      <div className="flex-1 p-6 space-y-6">
        {user.bio && (
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Bio</h3>
            <p className="text-text-primary text-sm">{user.bio}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Actions</h3>
          <div className="space-y-2">
            <Link to="/profile/$userId" params={{ userId: String(user.id) }}>
              <Button variant="outline" size="sm" className="w-full justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </Button>
            </Link>
          </div>
        </div>

        {conversation.created_at && (
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Conversation Started</h3>
            <p className="text-text-primary text-sm">
              {new Date(conversation.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GroupInfo({ groupId }: { groupId: number }) {
  const { data: group, isLoading } = useGroup(groupId);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-text-muted">Group not found</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg-surface overflow-y-auto">
      {/* Group header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-2xl font-bold overflow-hidden mb-4">
            {group.avatar_url ? (
              <img src={group.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              group.name.charAt(0).toUpperCase()
            )}
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">{group.name}</h2>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded font-medium ${
              group.type === 'public' ? 'bg-success/10 text-success' :
              group.type === 'private' ? 'bg-warning/10 text-warning' :
              'bg-bg-elevated text-text-secondary'
            }`}>
              {group.type}
            </span>
            <span className="text-sm text-text-secondary">
              {group.members?.length || 0} members
            </span>
          </div>
        </div>
      </div>

      {/* Group details */}
      <div className="flex-1 p-6 space-y-6">
        {group.description && (
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Description</h3>
            <p className="text-text-primary text-sm">{group.description}</p>
          </div>
        )}

        {group.members && group.members.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              Members ({group.members.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {group.members.slice(0, 10).map((member) => (
                <Link
                  key={member.user_id}
                  to="/profile/$userId"
                  params={{ userId: String(member.user_id) }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-elevated transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0">
                    {member.user?.avatar_url ? (
                      <img src={member.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      member.user?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary text-sm truncate">
                      {member.user?.username || 'Unknown'}
                    </div>
                    {member.role && member.role !== 'member' && (
                      <div className="text-xs text-accent capitalize">{member.role}</div>
                    )}
                  </div>
                </Link>
              ))}
              {group.members.length > 10 && (
                <div className="text-xs text-text-secondary text-center py-2">
                  And {group.members.length - 10} more...
                </div>
              )}
            </div>
          </div>
        )}

        {group.created_at && (
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Created</h3>
            <p className="text-text-primary text-sm">
              {new Date(group.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useConversation, useGroup } from '../../lib/hooks/useChat';
import { useAuth } from '../../lib/hooks/useAuth';
import { Link } from '@tanstack/react-router';

interface ChatHeaderInfoProps {
  type: 'conversation' | 'group';
  id: number;
}

export function ChatHeaderInfo({ type, id }: ChatHeaderInfoProps) {
  const { user } = useAuth();

  if (type === 'conversation') {
    const { data: conversation, isLoading } = useConversation(id);
    const otherParticipant = conversation?.participants?.find(p => p.user_id !== user?.id);

    if (isLoading || !otherParticipant) {
      return (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-bg-elevated animate-pulse" />
          <div className="flex-1 min-w-0">
            <div className="h-4 w-24 bg-bg-elevated rounded animate-pulse" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold overflow-hidden">
            {otherParticipant.user?.avatar_url ? (
              <img src={otherParticipant.user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              otherParticipant.user?.username?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-bg-surface" />
        </div>

        <div className="min-w-0">
          <Link
            to="/profile/$userId"
            params={{ userId: String(otherParticipant.user?.id) }}
            className="font-medium text-text-primary hover:underline truncate block"
          >
            {otherParticipant.user?.username || 'Unknown User'}
          </Link>
          <span className="text-xs text-text-muted">Online</span>
        </div>
      </div>
    );
  }

  const { data: group, isLoading } = useGroup(id);

  if (isLoading || !group) {
    return (
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-bg-elevated animate-pulse" />
        <div className="flex-1 min-w-0">
          <div className="h-4 w-32 bg-bg-elevated rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center overflow-hidden">
        {group.avatar_url ? (
          <img src={group.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-lg">{group.name.charAt(0).toUpperCase()}</span>
        )}
      </div>

      <div className="min-w-0">
        <div className="font-medium text-text-primary truncate">{group.name}</div>
        <div className="text-xs text-text-muted flex items-center gap-2">
          <span className={`px-1.5 py-0.5 text-xs rounded ${
            group.type === 'public' ? 'bg-success/10 text-success' :
            group.type === 'private' ? 'bg-warning/10 text-warning' :
            'bg-bg-elevated text-text-secondary'
          }`}>
            {group.type}
          </span>
          <span>{group.members?.length || 0} members</span>
        </div>
      </div>
    </div>
  );
}

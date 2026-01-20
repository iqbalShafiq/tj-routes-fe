import { Link } from '@tanstack/react-router';
import { useConversations } from '../../lib/hooks/useChat';
import { EmptyState } from '../ui/EmptyState';
import type { Conversation } from '../../lib/api/chat';

interface ConversationsListProps {
  onSelect: (type: 'conversation' | 'group', id: number) => void;
  selectedId: number | null;
  searchQuery: string;
}

export function ConversationsList({ onSelect, selectedId, searchQuery }: ConversationsListProps) {
  const { data, isLoading } = useConversations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-text-muted">Loading conversations...</div>
      </div>
    );
  }

  const conversations = data?.items || [];

  const filteredConversations = conversations.filter((conv: Conversation) => {
    if (!searchQuery.trim()) return true;
    const otherParticipant = conv.participants?.find(p => p.user);
    const username = otherParticipant?.user?.username?.toLowerCase() || '';
    return username.includes(searchQuery.toLowerCase());
  });

  if (filteredConversations.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
        title="No conversations yet"
        description="Start chatting with people you follow. Send a chat request to connect!"
        className="py-8 animate-scale-in"
      />
    );
  }

  return (
    <div className="divide-y divide-border animate-fade-in">
      {filteredConversations.map((conv: Conversation, index: number) => {
        const otherParticipant = conv.participants?.find(p => p.user) || {
          user: { id: 0, username: 'Unknown', avatar_url: '' }
        };
        const lastMessage = conv.messages?.[conv.messages.length - 1];

        return (
          <button
            key={conv.id}
            onClick={() => onSelect('conversation', conv.id)}
            className={`w-full p-4 text-left hover:bg-bg-elevated transition-all duration-200 active:scale-[0.98] flex items-center gap-3 ${
              selectedId === conv.id ? 'bg-bg-elevated' : ''
            } ${index < 3 ? `animate-stagger-${index + 1}` : ''}`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold overflow-hidden">
                {otherParticipant.user?.avatar_url ? (
                  <img src={otherParticipant.user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  otherParticipant.user?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-bg-surface" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-text-primary truncate">
                  {otherParticipant.user?.username || 'Unknown User'}
                </span>
                <span className="text-xs text-text-muted flex-shrink-0">
                  {formatMessageTime(lastMessage?.created_at)}
                </span>
              </div>
              <div className="text-sm text-text-secondary mt-1 truncate">
                {lastMessage?.content || 'No messages yet'}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function formatMessageTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

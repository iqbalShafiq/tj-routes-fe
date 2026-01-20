import { Link } from '@tanstack/react-router';
import { useConversations } from '../../lib/hooks/useChat';
import { Card } from '../ui/Card';
import type { Conversation } from '../../lib/api/chat';

export function ConversationList() {
  const { data: conversations, isLoading } = useConversations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-text-muted">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations?.items.map((conv: Conversation) => (
        <Link
          key={conv.id}
          to="/chat/conversations/$conversationId"
          params={{ conversationId: String(conv.id) }}
          className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-bg-hover transition-colors border border-border"
        >
          <div className="flex-shrink-0">
            {conv.participants.slice(0, 2).map((p) => (
              <div
                key={p.id}
                className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold mb-1 last:mb-0"
                title={p.username}
              >
                {p.username.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-text-primary truncate">
              {conv.participants.map((p) => p.username).join(', ')}
            </div>
            <div className="text-xs text-text-muted mt-1 truncate">
              {conv.messages?.[conv.messages.length - 1]?.content || 'No messages yet'}
            </div>
          </div>

          {hasUnread(conv) && (
            <span className="w-2 h-2 rounded-full bg-error text-white text-xs flex items-center justify-center flex-shrink-0">
              •
            </span>
          )}
        </Link>
      ))}

      {conversations?.items.length === 0 && (
        <div className="text-center p-8 text-text-muted">
          <p>No conversations yet. Start chatting with people you follow!</p>
        </div>
      )}
    </div>
  );
}

function hasUnread(conv: Conversation): boolean {
  return conv.participants.some((p) => !conv.messages || conv.messages.length === 0);
}

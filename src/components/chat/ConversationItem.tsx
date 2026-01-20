import { Link } from '@tanstack/react-router';
import type { Conversation } from '../../lib/api/chat';

interface ConversationItemProps {
  conversation: Conversation;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  return (
    <Link
      to="/chat/conversations/$conversationId"
      params={{ conversationId: String(conversation.id) }}
      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-bg-hover transition-colors border border-border"
    >
      <div className="flex -space-x-2">
        {conversation.participants.map((p) => (
          <div
            key={p.id}
            className="w-12 h-12 rounded-full bg-bg-surface text-text-secondary flex items-center justify-center text-sm font-medium overflow-hidden border-2 border-white"
            title={p.username}
          >
            {p.username.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-text-primary truncate">
          {conversation.participants.map((p) => p.username).join(', ')}
        </h3>
        <p className="text-sm text-text-muted truncate mt-1">
          {conversation.messages?.[conversation.messages.length - 1]?.content || 'No messages yet'}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {new Date(conversation.updated_at).toLocaleString()}
        </p>
      </div>

      <svg className="w-5 h-5 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6m0 0l-6 6m6-6m0 0l-6 6" />
      </svg>
    </Link>
  );
}

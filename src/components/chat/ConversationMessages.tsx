import { useEffect, useRef } from 'react';
import { useConversationMessages, useMarkConversationAsRead } from '../../lib/hooks/useChat';
import { useAuth } from '../../lib/hooks/useAuth';
import { EmptyState } from '../ui/EmptyState';
import type { Message } from '../../lib/api/chat';

interface ConversationMessagesProps {
  conversationId: number;
}

export function ConversationMessages({ conversationId }: ConversationMessagesProps) {
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useConversationMessages(conversationId);
  const markAsRead = useMarkConversationAsRead();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = data?.pages?.flatMap((page) => page.items) || [];

  useEffect(() => {
    if (conversationId) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-text-muted">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
        title="No messages yet"
        description="Send a message to start the conversation!"
        className="py-12"
      />
    );
  }

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
      {hasNextPage && (
        <button
          onClick={handleLoadMore}
          disabled={isFetchingNextPage}
          className="w-full py-2 text-sm text-accent hover:underline disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading...' : 'Load earlier messages'}
        </button>
      )}

      <div className="space-y-3">
        {messages.map((message: Message) => (
          <MessageBubble key={message.id} message={message} isOwn={message.sender_id === user?.id} />
        ))}
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden ${
            isOwn ? 'bg-accent text-white' : 'bg-bg-elevated text-text-secondary'
          }`}
          title={message.sender?.username}
        >
          {message.sender?.avatar_url ? (
            <img src={message.sender.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            message.sender?.username?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
      </div>

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isOwn
            ? 'bg-accent text-white rounded-br-sm'
            : 'bg-bg-elevated text-text-primary rounded-bl-sm'
        }`}
      >
        {!isOwn && (
          <span
            className={`text-xs font-medium mb-1 block ${
              isOwn ? 'text-white/80' : 'text-text-secondary'
            }`}
          >
            {message.sender?.username}
          </span>
        )}

        <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>

        <div className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-white/70' : 'text-text-muted'}`}>
          <span>{formatTime(message.created_at)}</span>
          {isOwn && message.status === 'read' && (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

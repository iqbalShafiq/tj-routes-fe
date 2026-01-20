import { useEffect, useRef, useState } from 'react';
import { useInfiniteForumMessages, useDeleteForumMessage, type ForumMessage } from '../../lib/hooks/useChat';
import { useAuth } from '../../lib/hooks/useAuth';
import { useChatContext } from '../../lib/hooks/useChatContext';
import { EmptyState } from '../ui/EmptyState';
import { ForumTypingIndicator } from './ForumTypingIndicator';

interface ForumChatMessagesProps {
  forumId: number;
  isMember: boolean;
}

export function ForumChatMessages({ forumId, isMember }: ForumChatMessagesProps) {
  const { user } = useAuth();
  const { isConnected } = useChatContext();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteForumMessages(forumId);
  const deleteMessage = useDeleteForumMessage();

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Messages ordered chronologically (oldest first, newest last)
  const messages = data?.pages?.flatMap((page) => page.items) || [];

  // Auto-scroll to bottom on initial load and new messages (if not user scrolling)
  useEffect(() => {
    if (!isUserScrolling && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isUserScrolling]);

  // Handle scroll for infinite loading and scroll button visibility
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Show scroll to bottom button if scrolled up
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
    setIsUserScrolling(!isNearBottom);

    // Load more messages when scrolled to top
    if (container.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      const previousHeight = container.scrollHeight;
      fetchNextPage().then(() => {
        // Maintain scroll position after loading older messages
        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - previousHeight;
          }
        }, 100);
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsUserScrolling(false);
  };

  const handleDelete = (msgId: number) => {
    if (!confirm('Delete this message?')) return;

    deleteMessage.mutate(
      { forumId, msgId },
      {
        onSuccess: () => {
          console.log('Message deleted successfully');
        },
        onError: (error) => {
          console.error('Failed to delete message:', error);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="animate-pulse text-text-muted">Loading messages...</div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <EmptyState
          icon={
            <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          }
          title="Members only"
          description="Join this forum to view and participate in the chat"
        />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <EmptyState
          icon={
            <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          }
          title="No messages yet"
          description="Be the first to say hello!"
        />
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Connection status */}
      {!isConnected && (
        <div className="bg-warning/10 text-warning px-4 py-2 text-xs text-center border-b border-warning/20">
          Disconnected - Reconnecting...
        </div>
      )}

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isFetchingNextPage && (
          <div className="text-center py-2 text-sm text-text-muted">Loading earlier messages...</div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <DateHeader date={date} />
            <div className="space-y-3 mt-3">
              {msgs.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.user_id === user?.id}
                  onDelete={() => handleDelete(message.id)}
                  canDelete={message.user_id === user?.id}
                />
              ))}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      <ForumTypingIndicator forumId={forumId} />

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-accent text-white p-3 rounded-full shadow-lg hover:bg-accent-hover transition-colors"
          title="Scroll to bottom"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}

interface DateHeaderProps {
  date: string;
}

function DateHeader({ date }: DateHeaderProps) {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="bg-bg-surface px-3 py-1 rounded-full text-xs text-text-muted border border-border">
        {date}
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ForumMessage;
  isOwn: boolean;
  onDelete: () => void;
  canDelete: boolean;
}

function MessageBubble({ message, isOwn, onDelete, canDelete }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}>
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden ${
            isOwn ? 'bg-accent text-white' : 'bg-bg-elevated text-text-secondary'
          }`}
          title={message.user?.username}
        >
          {message.user?.avatar_url ? (
            <img src={message.user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            message.user?.username?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
      </div>

      <div className="flex-1 max-w-[75%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-text-secondary">{message.user?.username}</span>
          <span className="text-xs text-text-muted">{formatTime(message.created_at)}</span>
          {canDelete && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary transition-opacity p-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute top-full right-0 mt-1 bg-bg-elevated border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-bg-surface transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwn
              ? 'bg-accent text-white rounded-br-sm'
              : 'bg-bg-elevated text-text-primary rounded-bl-sm'
          }`}
        >
          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

function groupMessagesByDate(messages: ForumMessage[]): Record<string, ForumMessage[]> {
  const groups: Record<string, ForumMessage[]> = {};

  messages.forEach((message) => {
    const dateKey = getDateLabel(message.created_at);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });

  return groups;
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time parts for comparison
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (messageDate.getTime() === todayDate.getTime()) {
    return 'Today';
  } else if (messageDate.getTime() === yesterdayDate.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

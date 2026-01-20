import { useEffect, useRef } from 'react';
import type { Message } from '../../lib/api/chat';

interface MessageListProps {
  messages: Message[];
  onScrollToBottom?: () => void;
  currentUser?: number;
}

export function MessageList({ messages, onScrollToBottom, currentUser }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, onScrollToBottom]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((message: Message, index) => {
        const isOwn = message.sender_id === currentUser;

        return (
          <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden ${
                  isOwn ? 'bg-accent text-white' : 'bg-bg-surface text-text-secondary'
                }`}
                title={message.sender?.username || 'Unknown'}
              >
                {message.sender?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            <div
              className={`flex-1 max-w-[70%] rounded-lg p-3 ${
                isOwn
                  ? 'bg-accent text-white rounded-br-none'
                  : 'bg-bg-surface text-text-primary rounded-bl-none'
              }`}
            >
              <p className="text-sm break-words">{message.content}</p>

              <div className={`text-xs mt-1 ${isOwn ? 'text-white/80' : 'text-text-muted'}`}>
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              {isOwn && message.status === 'read' && (
                <span className="ml-2 text-xs">✓</span>
              )}
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}

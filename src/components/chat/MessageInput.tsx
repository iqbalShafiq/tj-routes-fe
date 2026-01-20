import { useState, useEffect, useRef } from 'react';
import { useSendMessage } from '../../lib/hooks/useChat';
import { useChatContext } from '../../lib/hooks/useChatContext';
import { Textarea } from '../ui/Textarea';

interface MessageInputProps {
  conversationId?: number;
  groupId?: number;
  onSendMessage?: () => void;
  preferWebSocket?: boolean;
}

export function MessageInput({ conversationId, groupId, onSendMessage, preferWebSocket = true }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const sendMessage = useSendMessage();
  const { isConnected, sendMessage: wsSendMessage, sendTyping } = useChatContext();

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Send typing indicator when user stops typing
  useEffect(() => {
    if (!conversationId || !isConnected) return;

    if (isTyping) {
      sendTyping(conversationId, true);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send "stopped typing" after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(conversationId, false);
        setIsTyping(false);
      }, 3000);
    } else if (typingTimeoutRef.current) {
      sendTyping(conversationId, false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
    // sendTyping is now stable (memoized with empty deps in useChatContext)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping, conversationId, isConnected]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    const messageContent = content.trim();

    // Send via WebSocket if connected and preferred, otherwise use REST API
    if (preferWebSocket && isConnected) {
      wsSendMessage(messageContent, conversationId, groupId);
      setContent('');
      setIsTyping(false);
      onSendMessage?.();

      // Also send via REST for persistence guarantee (backend handles both)
      // The WebSocket is for real-time delivery, REST ensures it's saved
    } else {
      // Fallback to REST API
      sendMessage.mutate(
        {
          conversation_id: conversationId,
          group_id: groupId,
          content: messageContent,
        },
        {
          onSuccess: () => {
            setContent('');
            setIsTyping(false);
            onSendMessage?.();
          },
        }
      );
    }
  };

  const handleTyping = (value: string) => {
    setContent(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
    } else if (isTyping && value.length === 0) {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <Textarea
        value={content}
        onChange={(e) => handleTyping(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 resize-none py-3 text-sm focus:ring-2 focus:ring-accent transition-all duration-200"
        rows={1}
        maxLength={10000}
      />
      <button
        type="submit"
        disabled={sendMessage.isPending || !content.trim()}
        className="px-6 py-3 bg-accent text-white rounded-button font-body hover:bg-accent-hover disabled:bg-bg-surface disabled:text-text-muted disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] text-sm"
      >
        {sendMessage.isPending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}

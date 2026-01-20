import { useState, useEffect, useRef } from 'react';
import { useSendForumMessage } from '../../lib/hooks/useChat';
import { useChatContext } from '../../lib/hooks/useChatContext';
import { Textarea } from '../ui/Textarea';

interface ForumMessageInputProps {
  forumId: number;
  isMember: boolean;
  disabled?: boolean;
}

const MAX_CHARS = 1000;
const SHOW_COUNTER_AT = 900;

export function ForumMessageInput({ forumId, isMember, disabled = false }: ForumMessageInputProps) {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const sendMessage = useSendForumMessage();
  const { isConnected, sendMessage: wsSendMessage, sendTyping } = useChatContext();

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Send typing indicator when user stops typing
  useEffect(() => {
    if (!forumId || !isConnected || !isMember) return;

    if (isTyping) {
      sendTyping(undefined, true, forumId);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send "stopped typing" after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(undefined, false, forumId);
        setIsTyping(false);
      }, 3000);
    } else if (typingTimeoutRef.current) {
      sendTyping(undefined, false, forumId);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
    // sendTyping is now stable (memoized with empty deps in useChatContext)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping, forumId, isConnected, isMember]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[ForumMessageInput] Submit clicked', {
      content,
      isMember,
      isConnected,
      forumId
    });

    if (!content.trim()) {
      console.log('[ForumMessageInput] Content is empty, returning');
      return;
    }
    if (!isMember) {
      console.warn('[ForumMessageInput] User must be a forum member to send messages');
      return;
    }

    const messageContent = content.trim();

    // Send via WebSocket if connected, otherwise use REST API
    if (isConnected) {
      console.log('[ForumMessageInput] Sending via WebSocket:', messageContent);
      wsSendMessage(messageContent, undefined, undefined, forumId);
      setContent('');
      setIsTyping(false);
    } else {
      console.log('[ForumMessageInput] Sending via REST API (fallback):', messageContent);
      // Fallback to REST API
      sendMessage.mutate(
        {
          forumId,
          content: messageContent,
        },
        {
          onSuccess: () => {
            console.log('[ForumMessageInput] REST send successful');
            setContent('');
            setIsTyping(false);
          },
          onError: (error) => {
            console.error('[ForumMessageInput] Failed to send forum message:', error);
          },
        }
      );
    }
  };

  const handleTyping = (value: string) => {
    if (value.length > MAX_CHARS) {
      return; // Prevent exceeding max length
    }

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

  const isDisabled = disabled || !isMember;
  const showCharCounter = content.length >= SHOW_COUNTER_AT;
  const charsRemaining = MAX_CHARS - content.length;

  return (
    <div className="border-t border-border bg-bg-elevated">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                !isMember
                  ? 'Join the forum to send messages...'
                  : !isConnected
                    ? 'Type a message... (using REST API fallback)'
                    : 'Type a message... (Enter to send, Shift+Enter for new line)'
              }
              className="resize-none text-sm"
              rows={3}
              maxLength={MAX_CHARS}
              disabled={isDisabled}
            />
            {showCharCounter && (
              <div
                className={`text-xs mt-1 ${charsRemaining < 50 ? 'text-error' : 'text-text-muted'}`}
              >
                {charsRemaining} characters remaining
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isDisabled || sendMessage.isPending || !content.trim()}
            onClick={() => console.log('[ForumMessageInput] Button clicked', {
              isDisabled,
              isPending: sendMessage.isPending,
              hasContent: !!content.trim(),
              buttonDisabled: isDisabled || sendMessage.isPending || !content.trim()
            })}
            className="px-6 py-3 bg-accent text-white rounded-button font-body hover:bg-accent-hover disabled:bg-bg-surface disabled:text-text-muted disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
            title={!isMember ? 'Join the forum to send messages' : 'Send message'}
          >
            {sendMessage.isPending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

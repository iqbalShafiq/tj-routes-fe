import { useChatContext } from '../../lib/hooks/useChatContext';
import { useAuth } from '../../lib/hooks/useAuth';

interface TypingIndicatorProps {
  conversationId: number;
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const { getTypingUsersForConversation } = useChatContext();
  const { user } = useAuth();

  const typingUserIds = getTypingUsersForConversation(conversationId).filter(
    (userId) => userId !== user?.id
  );

  if (typingUserIds.length === 0) return null;

  return (
    <div className="text-xs text-text-muted py-2 px-4">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span>
          {typingUserIds.length === 1 ? 'Someone is typing...' : `${typingUserIds.length} people are typing...`}
        </span>
      </div>
    </div>
  );
}

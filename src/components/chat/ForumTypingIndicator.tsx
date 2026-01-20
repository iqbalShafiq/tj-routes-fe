import { useChatContext } from '../../lib/hooks/useChatContext';
import { useAuth } from '../../lib/hooks/useAuth';

interface ForumTypingIndicatorProps {
  forumId: number;
}

export function ForumTypingIndicator({ forumId }: ForumTypingIndicatorProps) {
  const { getTypingUsersForForum } = useChatContext();
  const { user } = useAuth();

  const typingUserIds = getTypingUsersForForum(forumId).filter(
    (userId) => userId !== user?.id
  );

  if (typingUserIds.length === 0) return null;

  let typingText = '';
  if (typingUserIds.length === 1) {
    typingText = 'Someone is typing...';
  } else if (typingUserIds.length <= 3) {
    typingText = `${typingUserIds.length} people are typing...`;
  } else {
    typingText = 'Several people are typing...';
  }

  return (
    <div className="text-xs text-text-muted py-2 px-4 bg-bg-surface">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span>{typingText}</span>
      </div>
    </div>
  );
}

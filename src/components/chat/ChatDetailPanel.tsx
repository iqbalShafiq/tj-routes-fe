import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ChatHeaderInfo } from './ChatHeaderInfo';
import { ConversationMessages } from './ConversationMessages';
import { GroupMessages } from './GroupMessages';
import { MessageInput } from './MessageInput';

interface ChatDetailPanelProps {
  type: 'conversation' | 'group';
  id: number;
  onClose: () => void;
}

export function ChatDetailPanel({ type, id, onClose }: ChatDetailPanelProps) {
  const isMobile = useMediaQuery('(max-width: 1023px)');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border animate-scale-in">
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-elevated rounded-lg transition-all duration-200 active:scale-95"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <ChatHeaderInfo type={type} id={id} />
        <button
          onClick={onClose}
          className="p-2 hover:bg-bg-elevated rounded-lg transition-all duration-200 active:scale-95"
          aria-label="Close chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {type === 'conversation' ? (
          <ConversationMessages conversationId={id} />
        ) : (
          <GroupMessages groupId={id} />
        )}
      </div>

      <div className="p-4 border-t border-border">
        <MessageInput
          conversationId={type === 'conversation' ? id : undefined}
          groupId={type === 'group' ? id : undefined}
        />
      </div>
    </div>
  );
}

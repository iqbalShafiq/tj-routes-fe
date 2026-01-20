import { useChatContext } from '../../lib/hooks/useChatContext';
import { ForumChatMessages } from './ForumChatMessages';
import { ForumMessageInput } from './ForumMessageInput';
import { Button } from '../ui/Button';

interface ForumChatPanelProps {
  forumId: number;
  isMember: boolean;
  memberCount: number;
  onJoin: () => void;
}

export function ForumChatPanel({ forumId, isMember, memberCount, onJoin }: ForumChatPanelProps) {
  const { isConnected } = useChatContext();

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] lg:h-[calc(100vh-12rem)] bg-bg-surface rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-elevated">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="font-display font-semibold text-text-primary">Live Chat</h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="hidden sm:inline">•</span>
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection indicator */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-success animate-pulse' : 'bg-error'
              }`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
            <span className="text-xs text-text-muted hidden sm:inline">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat content */}
      {isMember ? (
        <>
          <ForumChatMessages forumId={forumId} isMember={isMember} />
          <ForumMessageInput forumId={forumId} isMember={isMember} />
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
          <div className="text-center max-w-md">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
              Join the Forum to Chat
            </h3>
            <p className="text-text-muted text-sm mb-6">
              Become a member of this forum to participate in live chat discussions with other members.
            </p>
            <Button onClick={onJoin} variant="primary" size="md">
              Join Forum
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

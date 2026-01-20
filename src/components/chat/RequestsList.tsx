import { Link } from '@tanstack/react-router';
import { useReceivedChatRequests, useAcceptChatRequest, useRejectChatRequest } from '../../lib/hooks/useChat';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import type { ChatRequest } from '../../lib/api/chat';

interface RequestsListProps {
  onSelect: (type: 'conversation' | 'group', id: number) => void;
}

export function RequestsList({ onSelect }: RequestsListProps) {
  const { data, isLoading } = useReceivedChatRequests();
  const requests = data?.items || [];
  const acceptRequest = useAcceptChatRequest();
  const rejectRequest = useRejectChatRequest();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-text-muted">Loading requests...</div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        }
        title="No pending requests"
        description="Chat requests from users who want to connect with you will appear here."
        className="py-8 animate-scale-in"
      />
    );
  }

  return (
    <div className="divide-y divide-border animate-fade-in">
      {requests.map((request: ChatRequest, index: number) => (
        <div key={request.id} className={`p-4 ${index < 3 ? `animate-stagger-${index + 1}` : ''}`}>
          <div className="flex items-start gap-3">
            <Link to="/profile/$userId" params={{ userId: String(request.sender?.id) }}>
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold overflow-hidden hover:opacity-80 transition-opacity flex-shrink-0">
                {request.sender?.avatar_url ? (
                  <img src={request.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  request.sender?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">
                <Link to="/profile/$userId" params={{ userId: String(request.sender?.id) }} className="hover:underline">
                  {request.sender?.username}
                </Link>{' '}
                wants to chat
              </p>
              {request.message && (
                <p className="text-sm text-text-muted mt-1 line-clamp-2">"{request.message}"</p>
              )}
              <p className="text-xs text-text-secondary mt-1">
                {formatTimeAgo(request.created_at)}
              </p>

              <div className="flex gap-2 mt-3">
                {request.status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => acceptRequest.mutate(request.id)}
                      disabled={acceptRequest.isPending}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectRequest.mutate(request.id)}
                      disabled={rejectRequest.isPending}
                    >
                      Decline
                    </Button>
                  </>
                )}

                {request.status === 'accepted' && (
                  <Button variant="primary" size="sm" onClick={() => onSelect('conversation', request.id)}>
                    Open Chat
                  </Button>
                )}

                {request.status === 'rejected' && (
                  <span className="text-error text-sm font-medium">Declined</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

import { Link } from '@tanstack/react-router';
import { useReceivedChatRequests, useAcceptChatRequest, useRejectChatRequest } from '../../lib/hooks/useChat';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { ChatRequest } from '../../lib/api/chat';

export function ChatRequestList() {
  const { data: requests, isLoading } = useReceivedChatRequests();
  const acceptRequest = useAcceptChatRequest();
  const rejectRequest = useRejectChatRequest();

  if (isLoading) {
    return (
      <Card size="sm">
        <div className="p-8 text-center animate-pulse">Loading requests...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold mb-4">Chat Requests</h2>

      {requests?.items.map((request: ChatRequest) => (
        <Card key={request.id} size="sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full bg-bg-surface text-text-secondary flex items-center justify-center text-sm font-medium overflow-hidden"
                title={request.sender?.username}
              >
                {request.sender?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">
                {request.sender?.username} wants to start a conversation
              </p>
              <p className="text-sm text-text-muted mt-1">"{request.message}"</p>
              <p className="text-xs text-text-secondary mt-1">
                {new Date(request.created_at).toLocaleString()}
              </p>
            </div>

            <div className="flex-shrink-0 flex gap-2">
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
                    Reject
                  </Button>
                </>
              )}

              {request.status === 'accepted' && (
                <span className="text-success text-sm font-medium">✓ Accepted</span>
              )}

              {request.status === 'rejected' && (
                <span className="text-error text-sm font-medium">✗ Rejected</span>
              )}
            </div>
          </div>
        </Card>
      ))}

      {requests?.items.length === 0 && (
        <Card size="sm">
          <div className="p-8 text-center text-text-muted">
            <p>No pending chat requests.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

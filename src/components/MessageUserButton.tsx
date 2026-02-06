import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../lib/hooks/useAuth';
import {
  useConversations,
  useSentChatRequests,
  useReceivedChatRequests,
  useCreateChatRequest,
  useAcceptChatRequest
} from '../lib/hooks/useChat';
import { getMessageButtonState } from '../lib/utils/chatHelpers';
import { Button } from './ui/Button';

interface MessageUserButtonProps {
  userId: number;
  className?: string;
}

export const MessageUserButton = ({ userId, className }: MessageUserButtonProps) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Load data
  const { data: conversations } = useConversations();
  const { data: sentRequests } = useSentChatRequests();
  const { data: receivedRequests } = useReceivedChatRequests();

  // Mutations
  const createRequest = useCreateChatRequest();
  const acceptRequest = useAcceptChatRequest();

  // Don't show for own profile
  if (currentUser?.id === userId) return null;

  // Determine button state
  const buttonState = getMessageButtonState(
    userId,
    conversations?.items,
    sentRequests?.items,
    receivedRequests?.items
  );

  const handleClick = async () => {
    switch (buttonState.type) {
      case 'open_chat':
        navigate({ to: '/chat', search: { conversation: buttonState.conversationId, group: undefined } });
        break;

      case 'send_request':
        await createRequest.mutateAsync({ user_id: userId });
        break;

      case 'request_received':
        await acceptRequest.mutateAsync(buttonState.requestId!);
        break;

      case 'request_sent':
        // Do nothing - button is disabled
        break;
    }
  };

  // Button text and styling based on state
  const buttonConfig = {
    open_chat: { text: 'Open Chat', disabled: false },
    send_request: { text: 'Message', disabled: false },
    request_sent: { text: 'Request Sent', disabled: true },
    request_received: { text: 'Accept Chat', disabled: false },
  };

  const config = buttonConfig[buttonState.type];

  return (
    <Button
      onClick={handleClick}
      variant="secondary"
      size="sm"
      disabled={config.disabled || createRequest.isPending || acceptRequest.isPending}
      className={className}
    >
      {createRequest.isPending || acceptRequest.isPending ? 'Loading...' : config.text}
    </Button>
  );
};

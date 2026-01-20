import type { Conversation, ChatRequest } from '../api/chat';

/**
 * Find existing conversation with a specific user
 */
export function findConversationWithUser(
  conversations: Conversation[] | undefined,
  userId: number
): Conversation | null {
  if (!conversations) return null;

  return conversations.find(conv =>
    conv.participants?.some(p => p.user_id === userId)
  ) || null;
}

/**
 * Check if there's a pending chat request to a specific user
 */
export function findPendingRequestToUser(
  sentRequests: ChatRequest[] | undefined,
  userId: number
): ChatRequest | null {
  if (!sentRequests) return null;

  return sentRequests.find(req =>
    req.receiver_id === userId && req.status === 'pending'
  ) || null;
}

/**
 * Check if there's a pending chat request from a specific user
 */
export function findPendingRequestFromUser(
  receivedRequests: ChatRequest[] | undefined,
  userId: number
): ChatRequest | null {
  if (!receivedRequests) return null;

  return receivedRequests.find(req =>
    req.sender_id === userId && req.status === 'pending'
  ) || null;
}

/**
 * Message button state
 */
export interface MessageButtonState {
  type: 'open_chat' | 'send_request' | 'request_sent' | 'request_received';
  conversationId?: number;
  requestId?: number;
}

/**
 * Determine the message button state for a user
 */
export function getMessageButtonState(
  userId: number,
  conversations: Conversation[] | undefined,
  sentRequests: ChatRequest[] | undefined,
  receivedRequests: ChatRequest[] | undefined
): MessageButtonState {
  // Check for existing conversation first
  const existingConversation = findConversationWithUser(conversations, userId);
  if (existingConversation) {
    return { type: 'open_chat', conversationId: existingConversation.id };
  }

  // Check for pending request from us
  const sentRequest = findPendingRequestToUser(sentRequests, userId);
  if (sentRequest) {
    return { type: 'request_sent', requestId: sentRequest.id };
  }

  // Check for pending request from them
  const receivedRequest = findPendingRequestFromUser(receivedRequests, userId);
  if (receivedRequest) {
    return { type: 'request_received', requestId: receivedRequest.id };
  }

  // No existing relationship - can send request
  return { type: 'send_request' };
}

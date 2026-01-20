import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat';

// Response wrapper types
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

interface Conversation {
  id: number;
  type: string;
  created_at: string;
  updated_at: string;
  participants?: ConversationParticipant[];
  messages?: Message[];
}

interface ConversationParticipant {
  id: number;
  conversation_id: number;
  user_id: number;
  user?: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  last_read_at?: string;
  joined_at: string;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender?: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  conversation_id?: number;
  group_id?: number;
  message_type: string;
  reply_to_id?: number;
  status: string;
  created_at: string;
  updated_at: string;
  reactions?: MessageReaction[];
}

interface MessageReaction {
  id: number;
  message_id: number;
  user_id: number;
  emoji: string;
  created_at: string;
}

interface ChatRequest {
  id: number;
  sender_id: number;
  sender?: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  receiver_id: number;
  receiver?: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface GroupChat {
  id: number;
  name: string;
  description?: string;
  avatar_url?: string;
  type: string;
  max_members: number;
  created_by_id: number;
  created_by?: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
  members?: GroupMember[];
}

interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  user?: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  role: string;
  last_read_at?: string;
  muted_until?: string;
  joined_at: string;
}

interface GroupInvite {
  id: number;
  group_id: number;
  inviter_id: number;
  inviter?: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  invitee_id: number;
  invitee?: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  status: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface ForumMessage {
  id: number;
  forum_id: number;
  user_id: number;
  user?: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  content: string;
  created_at: string;
}

// Payload types
interface SendMessagePayload {
  content: string;
  conversation_id?: number;
  group_id?: number;
  reply_to_id?: number;
}

interface CreateConversationPayload {
  user_id: number;
}

interface CreateGroupPayload {
  name: string;
  description?: string;
  avatar_url?: string;
  type: 'public' | 'private' | 'restricted';
  max_members: number;
}

interface UpdateGroupPayload {
  name?: string;
  description?: string;
  avatar_url?: string;
  type?: 'public' | 'private' | 'restricted';
  max_members?: number;
}

// Query keys
export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: number) => [...chatKeys.all, 'conversation', id] as const,
  conversationMessages: (id: number) => [...chatKeys.conversation(), id, 'messages'] as const,
  sentRequests: () => [...chatKeys.all, 'sent-requests'] as const,
  receivedRequests: () => [...chatKeys.all, 'received-requests'] as const,
  groups: () => [...chatKeys.all, 'groups'] as const,
  group: (id: number) => [...chatKeys.groups(), id] as const,
  groupMembers: (id: number) => [...chatKeys.group(id), 'members'] as const,
  groupMessages: (id: number) => [...chatKeys.group(id), 'messages'] as const,
  messages: () => [...chatKeys.all, 'messages'] as const,
  forumMessages: (forumId: number) => ['forum', forumId, 'messages'] as const,
};

// Conversations
export const useConversations = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...chatKeys.conversations(), page, limit],
    queryFn: async () => {
      const response = await chatApi.listConversations(page, limit);
      return response;
    },
  });
};

export const useConversation = (id: number) => {
  return useQuery({
    queryKey: chatKeys.conversation(id),
    queryFn: async () => {
      const response = await chatApi.getConversation(id);
      return response;
    },
    enabled: !!id,
  });
};

export const useConversationMessages = (id: number) => {
  return useInfiniteQuery({
    queryKey: chatKeys.conversationMessages(id),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await chatApi.getConversationMessages(id, pageParam, 20);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!id,
  });
};

export const useGroupMessages = (id: number) => {
  return useInfiniteQuery({
    queryKey: chatKeys.groupMessages(id),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await chatApi.getMessages(undefined, id, pageParam, 20);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!id,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationPayload) => chatApi.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
};

export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => chatApi.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(id) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
};

// Chat Requests
export const useSentChatRequests = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...chatKeys.sentRequests(), page, limit],
    queryFn: async () => {
      const response = await chatApi.listSentRequests(page, limit);
      return response;
    },
  });
};

export const useReceivedChatRequests = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...chatKeys.receivedRequests(), page, limit],
    queryFn: async () => {
      const response = await chatApi.listReceivedRequests(page, limit);
      return response;
    },
  });
};

export const useAcceptChatRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => chatApi.acceptRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.receivedRequests() });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
};

export const useRejectChatRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => chatApi.rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.receivedRequests() });
    },
  });
};

export const useCreateChatRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { user_id: number }) => chatApi.createChatRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.sentRequests() });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
};

// Groups
export const useGroups = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...chatKeys.groups(), page, limit],
    queryFn: async () => {
      const response = await chatApi.listGroups(page, limit);
      return response;
    },
  });
};

export const useGroup = (id: number) => {
  return useQuery({
    queryKey: chatKeys.group(id),
    queryFn: async () => {
      const response = await chatApi.getGroup(id);
      return response;
    },
    enabled: !!id,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupPayload) => chatApi.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.groups() });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGroupPayload }) =>
      chatApi.updateGroup(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.group(id) });
      queryClient.invalidateQueries({ queryKey: chatKeys.groups() });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => chatApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.groups() });
    },
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => chatApi.joinGroup(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.group(id) });
      queryClient.invalidateQueries({ queryKey: chatKeys.groups() });
    },
  });
};

export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => chatApi.leaveGroup(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.group(id) });
      queryClient.invalidateQueries({ queryKey: chatKeys.groups() });
    },
  });
};

export const useGroupMembers = (id: number, page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...chatKeys.groupMembers(id), page, limit],
    queryFn: async () => {
      const response = await chatApi.listGroupMembers(id, page, limit);
      return response;
    },
    enabled: !!id,
  });
};

export const useAddGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) =>
      chatApi.addMember(groupId, userId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.groupMembers(groupId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.group(groupId) });
    },
  });
};

export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) =>
      chatApi.removeMember(groupId, userId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.groupMembers(groupId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.group(groupId) });
    },
  });
};

export const useUpdateGroupMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId, role }: { groupId: number; userId: number; role: string }) =>
      chatApi.updateMemberRole(groupId, userId, role),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.groupMembers(groupId) });
    },
  });
};

export const useMarkGroupAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => chatApi.markGroupAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.group(id) });
    },
  });
};

export const useMuteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, mutedUntil }: { id: number; mutedUntil?: string }) =>
      chatApi.muteGroup(id, mutedUntil),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.group(id) });
    },
  });
};

export const useGroupInvites = (id: number, page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...chatKeys.group(id), 'invites', page, limit],
    queryFn: async () => {
      const response = await chatApi.listGroupInvites(id, page, limit);
      return response;
    },
    enabled: !!id,
  });
};

export const useUserGroupInvites = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...chatKeys.all, 'user-invites', page, limit],
    queryFn: async () => {
      const response = await chatApi.listUserInvites(page, limit);
      return response;
    },
  });
};

export const useCreateGroupInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, inviteeId }: { groupId: number; inviteeId: number }) =>
      chatApi.createInvite(groupId, inviteeId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: [...chatKeys.group(groupId), 'invites'] });
    },
  });
};

export const useAcceptGroupInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: number) => chatApi.acceptInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all, 'user-invites'] });
      queryClient.invalidateQueries({ queryKey: chatKeys.groups() });
    },
  });
};

export const useRejectGroupInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: number) => chatApi.rejectInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all, 'user-invites'] });
    },
  });
};

export const useRevokeGroupInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inviteId, groupId }: { inviteId: number; groupId: number }) =>
      chatApi.revokeInvite(inviteId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: [...chatKeys.group(groupId), 'invites'] });
    },
  });
};

// Messages
export const useMessages = (conversationId?: number, groupId?: number, page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...chatKeys.messages(), conversationId, groupId, page, limit],
    queryFn: async () => {
      const response = await chatApi.getMessages(conversationId, groupId, page, limit);
      return response;
    },
    enabled: !!(conversationId || groupId),
  });
};

export const useMessage = (id: number) => {
  return useQuery({
    queryKey: [...chatKeys.all, 'message', id],
    queryFn: async () => {
      const response = await chatApi.getMessage(id);
      return response;
    },
    enabled: !!id,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessagePayload) => chatApi.sendMessage(data),
    onSuccess: (_, { conversation_id, group_id }) => {
      if (conversation_id) {
        queryClient.invalidateQueries({ queryKey: chatKeys.conversationMessages(conversation_id) });
        queryClient.invalidateQueries({ queryKey: chatKeys.conversation(conversation_id) });
      }
      if (group_id) {
        queryClient.invalidateQueries({ queryKey: [...chatKeys.groupMessages(group_id)] });
        queryClient.invalidateQueries({ queryKey: chatKeys.group(group_id) });
      }
    },
  });
};

export const useUpdateMessageStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      chatApi.updateMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages() });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => chatApi.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages() });
    },
  });
};

export const useMessageReactions = (messageId: number) => {
  return useQuery({
    queryKey: [...chatKeys.all, 'message', messageId, 'reactions'],
    queryFn: async () => {
      const response = await chatApi.getMessageReactions(messageId);
      return response;
    },
    enabled: !!messageId,
  });
};

export const useAddMessageReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: number; emoji: string }) =>
      chatApi.addReaction(messageId, { emoji }),
    onSuccess: (_, { messageId }) => {
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all, 'message', messageId, 'reactions'] });
    },
  });
};

export const useRemoveMessageReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: number) => chatApi.removeReaction(messageId),
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all, 'message', messageId, 'reactions'] });
    },
  });
};

// Forum Messages
export const useForumMessages = (forumId: number, page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...chatKeys.forumMessages(forumId), page, limit],
    queryFn: async () => {
      const response = await chatApi.listForumMessages(forumId, page, limit);
      return response;
    },
    enabled: !!forumId,
  });
};

export const useInfiniteForumMessages = (forumId: number, limit = 50) => {
  return useInfiniteQuery({
    queryKey: chatKeys.forumMessages(forumId),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await chatApi.listForumMessages(forumId, pageParam, limit);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!forumId && forumId > 0,
    staleTime: 1000 * 60, // 1 minute (shorter than default for real-time feel)
  });
};

export const useSendForumMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ forumId, content }: { forumId: number; content: string }) =>
      chatApi.sendForumMessage(forumId, { content }),
    onSuccess: (_, { forumId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.forumMessages(forumId) });
    },
  });
};

export const useDeleteForumMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ forumId, msgId }: { forumId: number; msgId: number }) =>
      chatApi.deleteForumMessage(forumId, msgId),
    onSuccess: (_, { forumId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.forumMessages(forumId) });
    },
  });
};

// Export types
export type {
  Conversation,
  ConversationParticipant,
  Message,
  MessageReaction,
  ChatRequest,
  GroupChat,
  GroupMember,
  GroupInvite,
  ForumMessage,
  SendMessagePayload,
  CreateConversationPayload,
  CreateGroupPayload,
  UpdateGroupPayload,
  PaginatedResponse,
};

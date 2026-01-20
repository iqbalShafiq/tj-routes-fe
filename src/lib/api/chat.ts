import apiClient from './client';

// Base Types
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'file' | 'system';
export type ChatRequestStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type GroupType = 'public' | 'private' | 'restricted';
export type GroupRole = 'admin' | 'moderator' | 'member';

// User Types
export interface UserBasic {
  id: number;
  username: string;
  email?: string;
  avatar_url?: string;
}

export interface User extends UserBasic {
  role: 'admin' | 'common_user';
  reputation_points: number;
}

// Conversation Types
export interface Conversation {
  id: number;
  type: 'direct';
  created_at: string;
  updated_at: string;
  participants: ConversationParticipant[];
  messages?: Message[];
}

export interface ConversationParticipant {
  id: number;
  conversation_id: number;
  user_id: number;
  user: UserBasic;
  last_read_at?: string;
  joined_at: string;
}

export interface ChatRequest {
  id: number;
  sender_id: number;
  sender: UserBasic;
  receiver_id: number;
  receiver: UserBasic;
  message: string;
  status: ChatRequestStatus;
  created_at: string;
}

// Group Types
export interface GroupChat {
  id: number;
  name: string;
  description?: string;
  avatar_url?: string;
  type: GroupType;
  max_members: number;
  created_by_id: number;
  created_by?: UserBasic;
  created_at: string;
  updated_at: string;
  members?: GroupMember[];
}

export interface GroupChatDetail extends GroupChat {
  members: GroupMember[];
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  user: UserBasic;
  role: GroupRole;
  last_read_at?: string;
  muted_until?: string;
  joined_at: string;
}

export interface GroupInvite {
  id: number;
  group_id: number;
  inviter_id: number;
  inviter: UserBasic;
  invitee_id: number;
  invitee: UserBasic;
  status: ChatRequestStatus;
  expires_at: string;
  created_at: string;
}

// Message Types
export interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender: UserBasic;
  conversation_id?: number | null;
  group_id?: number | null;
  forum_id?: number | null;
  message_type: MessageType;
  reply_to_id?: number | null;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
  reactions?: MessageReaction[];
}

export interface MessageDetail extends Message {
  reply_to?: Message;
  reactions: MessageReaction[];
}

export interface MessageReaction {
  id: number;
  message_id: number;
  user_id: number;
  user: UserBasic;
  emoji: string;
  created_at: string;
}

export interface ForumMessage {
  id: number;
  forum_id: number;
  user_id: number;
  user: UserBasic;
  content: string;
  created_at: string;
}

// Response Types
export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ConversationResponse {
  success: boolean;
  data: Conversation;
}

export interface ChatRequestsResponse {
  success: boolean;
  data: {
    requests: ChatRequest[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ChatRequestResponse {
  success: boolean;
  data: ChatRequest;
}

export interface GroupsResponse {
  success: boolean;
  data: {
    items: GroupChat[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface GroupResponse {
  success: boolean;
  data: GroupChatDetail;
}

export interface GroupInvitesResponse {
  success: boolean;
  data: {
    invites: GroupInvite[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface GroupInviteResponse {
  success: boolean;
  data: GroupInvite;
}

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface MessageResponse {
  success: boolean;
  data: MessageDetail;
}

export interface ForumMessagesResponse {
  success: boolean;
  data: {
    messages: ForumMessage[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ForumMessageResponse {
  success: boolean;
  data: ForumMessage;
}

export interface MessageResponseWrapper {
  success: boolean;
  message?: string;
  data?: any;
}

// Request Types
export interface CreateConversationRequest {
  user_id: number;
}

export interface SendMessageRequest {
  conversation_id?: number | null;
  group_id?: number | null;
  content: string;
  reply_to_id?: number | null;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  avatar_url?: string;
  type: GroupType;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  avatar_url?: string;
  type?: GroupType;
}

export interface CreateGroupInviteRequest {
  invitee_id: number;
}

export interface SendForumMessageRequest {
  content: string;
}

export interface AddMessageReactionRequest {
  emoji: string;
}

export interface UpdateGroupMemberRoleRequest {
  role: GroupRole;
}

// WebSocket Message Types
export interface WSMessage {
  type: string;
  payload?: any;
  data?: any;
}

export type WSMessageType = 
  | 'send_message'
  | 'mark_read'
  | 'typing_start'
  | 'typing_stop'
  | 'ping'
  | 'pong'
  | 'new_message'
  | 'message_read'
  | 'typing'
  | 'presence';

export interface SendMessagePayload {
  conversation_id?: number;
  group_id?: number;
  content: string;
  reply_to_id?: number;
}

export interface MarkReadPayload {
  conversation_id: number;
  message_id: number;
}

export interface TypingStartPayload {
  conversation_id: number;
}

export interface TypingStopPayload {
  conversation_id: number;
}

export interface PresencePayload {
  user_id: number;
  status: 'online' | 'offline';
  room_id: string;
}

export interface NewMessagePayload {
  data: Message;
}

export interface TypingPayload {
  user_id: number;
  conversation_id: number;
  is_typing: boolean;
}

// API Functions
export const chatApi = {
  // Conversations
  listConversations: async (page = 1, limit = 10): Promise<{
    items: Conversation[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<ConversationsResponse>(
      `/api/v1/chat/conversations?${params}`
    );

    if (response.data.success && response.data.data.conversations) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        items: response.data.data.conversations,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { items: [], total: 0, page, limit, total_pages: 0 };
  },

  getConversation: async (id: number): Promise<Conversation> => {
    const response = await apiClient.get<ConversationResponse>(`/api/v1/chat/conversations/${id}`);
    return response.data.data;
  },

  createConversation: async (data: CreateConversationRequest): Promise<Conversation> => {
    const response = await apiClient.post<ConversationResponse>('/api/v1/chat/conversations', data);
    return response.data.data;
  },

  deleteConversation: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/chat/conversations/${id}`);
  },

  getConversationMessages: async (id: number, page = 1, limit = 20): Promise<{
    items: Message[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<MessagesResponse>(
      `/api/v1/chat/conversations/${id}/messages?${params}`
    );

    if (response.data.success && response.data.data.messages) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        items: response.data.data.messages,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { items: [], total: 0, page, limit, total_pages: 0 };
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/api/v1/chat/conversations/${id}/read`);
  },

  // Chat Requests
  listSentRequests: async (page = 1, limit = 10): Promise<{
    items: ChatRequest[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<ChatRequestsResponse>(
      `/api/v1/chat/requests/sent?${params}`
    );

    if (response.data.success && response.data.data.requests) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        items: response.data.data.requests,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { items: [], total: 0, page, limit, total_pages: 0 };
  },

  listReceivedRequests: async (page = 1, limit = 10): Promise<{
    items: ChatRequest[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<ChatRequestsResponse>(
      `/api/v1/chat/requests/received?${params}`
    );

    if (response.data.success && response.data.data.requests) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        items: response.data.data.requests,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { items: [], total: 0, page, limit, total_pages: 0 };
  },

  createChatRequest: async (data: CreateConversationRequest): Promise<ChatRequest> => {
    const response = await apiClient.post<ChatRequestResponse>('/api/v1/chat/requests', data);
    return response.data.data;
  },

  acceptRequest: async (id: number): Promise<void> => {
    await apiClient.put(`/api/v1/chat/requests/${id}/accept`);
  },

  rejectRequest: async (id: number): Promise<void> => {
    await apiClient.put(`/api/v1/chat/requests/${id}/reject`);
  },

  // Groups
  listGroups: async (page = 1, limit = 10): Promise<{
    items: GroupChat[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<GroupsResponse>(`/api/v1/groups?${params}`);

    if (response.data.success && response.data.data.items) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        items: response.data.data.items,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { items: [], total: 0, page, limit, total_pages: 0 };
  },

  getGroup: async (id: number): Promise<GroupChatDetail> => {
    const response = await apiClient.get<GroupResponse>(`/api/v1/groups/${id}`);
    return response.data.data;
  },

  createGroup: async (data: CreateGroupRequest): Promise<GroupChat> => {
    const response = await apiClient.post<GroupResponse>('/api/v1/groups', data);
    return response.data.data;
  },

  updateGroup: async (id: number, data: UpdateGroupRequest): Promise<GroupChat> => {
    const response = await apiClient.put<GroupResponse>(`/api/v1/groups/${id}`, data);
    return response.data.data;
  },

  deleteGroup: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/groups/${id}`);
  },

  updateAvatar: async (id: number, avatar_url: string): Promise<GroupChat> => {
    const response = await apiClient.put<GroupResponse>(`/api/v1/groups/${id}/avatar`, {
      avatar_url,
    });
    return response.data.data;
  },

  joinGroup: async (id: number): Promise<void> => {
    await apiClient.post(`/api/v1/groups/${id}/join`);
  },

  leaveGroup: async (id: number): Promise<void> => {
    await apiClient.post(`/api/v1/groups/${id}/leave`);
  },

  // Group Members
  listGroupMembers: async (id: number, page = 1, limit = 20): Promise<{
    items: GroupMember[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<PaginatedResponse<GroupMember>>(
      `/api/v1/groups/${id}/members?${params}`
    );

    if (response.data.success && response.data.data.items) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        items: response.data.data.items,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { items: [], total: 0, page, limit, total_pages: 0 };
  },

  addMember: async (id: number, user_id: number): Promise<void> => {
    await apiClient.post(`/api/v1/groups/${id}/members`, { user_id });
  },

  removeMember: async (groupId: number, memberId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/groups/${groupId}/members/${memberId}`);
  },

  updateMemberRole: async (groupId: number, memberId: number, role: GroupRole): Promise<void> => {
    await apiClient.put(`/api/v1/groups/${groupId}/members/${memberId}/role`, { role });
  },

  markGroupAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/api/v1/groups/${id}/read`);
  },

  muteGroup: async (id: number, muted_until?: string): Promise<void> => {
    await apiClient.put(`/api/v1/groups/${id}/mute`, { muted_until });
  },

  getMemberCount: async (id: number): Promise<{ count: number }> => {
    const response = await apiClient.get<{ success: boolean; data: { count: number } }>(
      `/api/v1/groups/${id}/member-count`
    );
    return response.data.data;
  },

  checkMembership: async (id: number): Promise<{ is_member: boolean; role?: string }> => {
    const response = await apiClient.get<{ success: boolean; data: { is_member: boolean; role?: string } }>(
      `/api/v1/groups/${id}/membership`
    );
    return response.data.data;
  },

  // Group Invites
  listGroupInvites: async (id: number, page = 1, limit = 10): Promise<{
    items: GroupInvite[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<GroupInvitesResponse>(
      `/api/v1/groups/${id}/invites?${params}`
    );

    if (response.data.success && response.data.data.invites) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        items: response.data.data.invites,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { items: [], total: 0, page, limit, total_pages: 0 };
  },

  createInvite: async (id: number, data: CreateGroupInviteRequest): Promise<GroupInvite> => {
    const response = await apiClient.post<GroupInviteResponse>(
      `/api/v1/groups/${id}/invites`,
      data
    );
    return response.data.data;
  },

  listUserInvites: async (page = 1, limit = 10): Promise<{
    items: GroupInvite[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<PaginatedResponse<GroupInvite>>(
      `/api/v1/groups/invites?${params}`
    );

    if (response.data.success && response.data.data.items) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        items: response.data.data.items,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { items: [], total: 0, page, limit, total_pages: 0 };
  },

  acceptInvite: async (inviteId: number): Promise<void> => {
    await apiClient.post(`/api/v1/groups/invites/${inviteId}/accept`);
  },

  rejectInvite: async (inviteId: number): Promise<void> => {
    await apiClient.post(`/api/v1/groups/invites/${inviteId}/reject`);
  },

  revokeInvite: async (inviteId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/groups/invites/${inviteId}`);
  },

  // Messages
  getMessages: async (
    conversation_id?: number,
    group_id?: number,
    page = 1,
    limit = 20
  ): Promise<{
    items: Message[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (conversation_id) params.append('conversation_id', conversation_id.toString());
    if (group_id) params.append('group_id', group_id.toString());

    const response = await apiClient.get<MessagesResponse>(
      `/api/v1/chat/messages?${params}`
    );

    if (response.data.success && response.data.data.messages) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        items: response.data.data.messages,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { items: [], total: 0, page, limit, total_pages: 0 };
  },

  getMessage: async (id: number): Promise<MessageDetail> => {
    const response = await apiClient.get<MessageResponse>(`/api/v1/chat/messages/${id}`);
    return response.data.data;
  },

  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    const response = await apiClient.post<MessageResponse>('/api/v1/chat/messages', data);
    return response.data.data;
  },

  updateMessageStatus: async (id: number, status: MessageStatus): Promise<Message> => {
    const response = await apiClient.put<MessageResponse>(
      `/api/v1/chat/messages/${id}/status`,
      { status }
    );
    return response.data.data;
  },

  deleteMessage: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/chat/messages/${id}`);
  },

  // Message Reactions
  getMessageReactions: async (id: number): Promise<MessageReaction[]> => {
    const response = await apiClient.get<{ success: boolean; data: MessageReaction[] }>(
      `/api/v1/chat/messages/${id}/reactions`
    );
    return response.data.data;
  },

  addReaction: async (id: number, data: AddMessageReactionRequest): Promise<MessageReaction> => {
    const response = await apiClient.post<MessageResponse>(
      `/api/v1/chat/messages/${id}/reactions`,
      data
    );
    return response.data.data.reactions?.[0] || {} as MessageReaction;
  },

  removeReaction: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/chat/messages/${id}/reactions`);
  },

  // Forum Messages
  listForumMessages: async (forumId: number, page = 1, limit = 20): Promise<{
    items: ForumMessage[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<ForumMessagesResponse>(
      `/api/v1/forums/${forumId}/messages?${params}`
    );

    if (response.data.success && response.data.data.messages) {
      const total = response.data.data.total;
      const total_pages = Math.ceil(total / limit);
      return {
        items: response.data.data.messages,
        total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        total_pages,
      };
    }
    return { items: [], total: 0, page, limit, total_pages: 0 };
  },

  sendForumMessage: async (forumId: number, data: SendForumMessageRequest): Promise<ForumMessage> => {
    const response = await apiClient.post<ForumMessageResponse>(
      `/api/v1/forums/${forumId}/messages`,
      data
    );
    return response.data.data;
  },

  deleteForumMessage: async (forumId: number, msgId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/forums/${forumId}/messages/${msgId}`);
  },
};

export default chatApi;

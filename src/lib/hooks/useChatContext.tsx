import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { chatKeys } from './useChat';
import type { Message } from '../api/chat';

interface TypingUser {
  userId: number;
  conversationId?: number;
  forumId?: number;
  timestamp: number;
}

interface OnlineUser {
  userId: number;
  roomId: string;
}

interface ChatContextValue {
  // WebSocket state
  isConnected: boolean;
  connectionState: string;

  // Room management
  currentRoomId: string | null;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;

  // Messaging
  sendMessage: (content: string, conversationId?: number, groupId?: number, forumId?: number) => void;
  sendTyping: (conversationId?: number, isTyping?: boolean, forumId?: number) => void;
  markAsRead: (conversationId: number, messageId: number) => void;

  // Real-time state
  typingUsers: TypingUser[];
  onlineUsers: OnlineUser[];
  getTypingUsersForConversation: (conversationId: number) => number[];
  getTypingUsersForForum: (forumId: number) => number[];
  isUserOnline: (userId: number, roomId?: string) => boolean;
}

const ChatContext = createContext<ChatContextValue | null>(null);

interface ChatProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export function ChatProvider({ children, enabled = true }: ChatProviderProps) {
  const queryClient = useQueryClient();
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  // Setup WebSocket with event handlers
  const {
    isConnected,
    connectionState,
    sendMessage: wsSendMessage,
    joinRoom: wsJoinRoom,
    leaveRoom: wsLeaveRoom,
    sendTyping: wsSendTyping,
    markAsRead: wsMarkAsRead,
  } = useWebSocket({
    enabled,
    onConnect: () => {
      console.log('[ChatProvider] WebSocket connected');
      // Rejoin current room if we were in one
      if (currentRoomId) {
        wsJoinRoom(currentRoomId);
      }
    },
    onDisconnect: () => {
      console.log('[ChatProvider] WebSocket disconnected');
    },
    onNewMessage: (message: Message) => {
      console.log('[ChatProvider] New message received (conversation/group):', message);

      // Invalidate relevant queries to refresh the UI
      if (message.conversation_id) {
        console.log('[ChatProvider] Invalidating conversation queries:', message.conversation_id);
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversationMessages(message.conversation_id),
        });
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversation(message.conversation_id),
        });
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversations(),
        });
      }

      if (message.group_id) {
        console.log('[ChatProvider] Invalidating group queries:', message.group_id);
        queryClient.invalidateQueries({
          queryKey: chatKeys.groupMessages(message.group_id),
        });
        queryClient.invalidateQueries({
          queryKey: chatKeys.group(message.group_id),
        });
      }

      if (message.forum_id) {
        console.log('[ChatProvider] Invalidating forum queries:', message.forum_id);
        console.log('[ChatProvider] Forum query key:', chatKeys.forumMessages(message.forum_id));
        queryClient.invalidateQueries({
          queryKey: chatKeys.forumMessages(message.forum_id),
        });
      }
    },
    onNewForumMessage: (message: any) => {
      console.log('[ChatProvider] New forum message received (broadcast):', message);
      if (message.forum_id) {
        console.log('[ChatProvider] Invalidating forum queries for broadcast:', message.forum_id);
        queryClient.invalidateQueries({
          queryKey: chatKeys.forumMessages(message.forum_id),
        });
      }
    },
    onForumMessageSent: (message: any) => {
      console.log('[ChatProvider] Forum message sent confirmation:', message);
      if (message.forum_id) {
        console.log('[ChatProvider] Invalidating forum queries for sent message:', message.forum_id);
        queryClient.invalidateQueries({
          queryKey: chatKeys.forumMessages(message.forum_id),
        });
      }
    },
    onTyping: (data) => {
      const { user_id, conversation_id, forum_id, is_typing } = data;

      setTypingUsers((prev) => {
        const now = Date.now();
        // Remove stale entries and existing entry for this user in this conversation/forum
        const filtered = prev.filter((tu) => {
          const isStale = now - tu.timestamp > 5000;
          const isSameUser =
            tu.userId === user_id &&
            ((conversation_id && tu.conversationId === conversation_id) ||
              (forum_id && tu.forumId === forum_id));
          return !isStale && !isSameUser;
        });

        // Add new entry if user is typing
        if (is_typing) {
          return [
            ...filtered,
            {
              userId: user_id,
              conversationId: conversation_id,
              forumId: forum_id,
              timestamp: now,
            },
          ];
        }

        return filtered;
      });

      // Auto-remove typing indicator after 5 seconds of no updates
      if (is_typing) {
        setTimeout(() => {
          setTypingUsers((prev) => {
            const now = Date.now();
            return prev.filter((tu) => {
              const isSameUser =
                tu.userId === user_id &&
                ((conversation_id && tu.conversationId === conversation_id) ||
                  (forum_id && tu.forumId === forum_id));
              return !isSameUser || now - tu.timestamp < 5000;
            });
          });
        }, 5000);
      }
    },
    onPresence: (data) => {
      const { user_id, status, room_id } = data;

      setOnlineUsers((prev) => {
        const filtered = prev.filter((ou) => ou.userId !== user_id || ou.roomId !== room_id);

        if (status === 'online') {
          return [...filtered, { userId: user_id, roomId: room_id }];
        }

        return filtered;
      });
    },
    onMessageRead: (data) => {
      // Invalidate conversation to update read status
      if (data.conversation_id) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversation(data.conversation_id),
        });
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversations(),
        });
      }
    },
  });

  // Store WebSocket functions in refs to avoid dependency issues
  const wsJoinRoomRef = useRef(wsJoinRoom);
  const wsLeaveRoomRef = useRef(wsLeaveRoom);
  const wsSendMessageRef = useRef(wsSendMessage);
  const wsSendTypingRef = useRef(wsSendTyping);
  const wsMarkAsReadRef = useRef(wsMarkAsRead);

  // Update refs when functions change
  useEffect(() => {
    wsJoinRoomRef.current = wsJoinRoom;
    wsLeaveRoomRef.current = wsLeaveRoom;
    wsSendMessageRef.current = wsSendMessage;
    wsSendTypingRef.current = wsSendTyping;
    wsMarkAsReadRef.current = wsMarkAsRead;
  }, [wsJoinRoom, wsLeaveRoom, wsSendMessage, wsSendTyping, wsMarkAsRead]);

  // Room management with stable references
  const joinRoom = useCallback((roomId: string) => {
    setCurrentRoomId((prevRoomId) => {
      // Leave current room if different
      if (prevRoomId && prevRoomId !== roomId) {
        wsLeaveRoomRef.current(prevRoomId);
      }

      // Join new room
      wsJoinRoomRef.current(roomId);
      return roomId;
    });
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    wsLeaveRoomRef.current(roomId);
    setCurrentRoomId((prevRoomId) => (prevRoomId === roomId ? null : prevRoomId));
  }, []);

  // Message operations with stable references
  const sendMessage = useCallback(
    (content: string, conversationId?: number, groupId?: number, forumId?: number) => {
      wsSendMessageRef.current(content, conversationId, groupId, forumId);
    },
    []
  );

  const sendTyping = useCallback((conversationId?: number, isTyping: boolean = false, forumId?: number) => {
    wsSendTypingRef.current(conversationId, isTyping, forumId);
  }, []);

  const markAsRead = useCallback((conversationId: number, messageId: number) => {
    wsMarkAsReadRef.current(conversationId, messageId);
  }, []);

  // Helper functions
  const getTypingUsersForConversation = useCallback(
    (conversationId: number): number[] => {
      const now = Date.now();
      return typingUsers
        .filter((tu) => tu.conversationId === conversationId && now - tu.timestamp < 5000)
        .map((tu) => tu.userId);
    },
    [typingUsers]
  );

  const getTypingUsersForForum = useCallback(
    (forumId: number): number[] => {
      const now = Date.now();
      return typingUsers
        .filter((tu) => tu.forumId === forumId && now - tu.timestamp < 5000)
        .map((tu) => tu.userId);
    },
    [typingUsers]
  );

  const isUserOnline = useCallback(
    (userId: number, roomId?: string): boolean => {
      if (roomId) {
        return onlineUsers.some((ou) => ou.userId === userId && ou.roomId === roomId);
      }
      return onlineUsers.some((ou) => ou.userId === userId);
    },
    [onlineUsers]
  );

  const value: ChatContextValue = {
    isConnected,
    connectionState,
    currentRoomId,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    markAsRead,
    typingUsers,
    onlineUsers,
    getTypingUsersForConversation,
    getTypingUsersForForum,
    isUserOnline,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

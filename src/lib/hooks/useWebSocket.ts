import { useEffect, useRef, useCallback, useState } from 'react';
import { createChatWebSocketManager } from '../websocket/chat-websocket';
import type { ChatWebSocketManager, WSConnectionState } from '../websocket/chat-websocket';
import type { Message, WSMessage } from '../api/chat';

interface UseWebSocketOptions {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  onNewMessage?: (message: Message) => void;
  onNewForumMessage?: (message: any) => void;
  onForumMessageSent?: (message: any) => void;
  onTyping?: (data: { user_id: number; conversation_id?: number; forum_id?: number; is_typing: boolean }) => void;
  onPresence?: (data: { user_id: number; status: 'online' | 'offline'; room_id: string }) => void;
  onMessageRead?: (data: { conversation_id: number; message_id: number; user_id: number }) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { enabled = true } = options;

  const wsRef = useRef<ChatWebSocketManager | null>(null);
  const [connectionState, setConnectionState] = useState<WSConnectionState>('disconnected');
  const [isConnected, setIsConnected] = useState(false);

  // Store callbacks in refs to avoid recreating WebSocket on every render
  const onConnectRef = useRef(options.onConnect);
  const onDisconnectRef = useRef(options.onDisconnect);
  const onErrorRef = useRef(options.onError);
  const onNewMessageRef = useRef(options.onNewMessage);
  const onNewForumMessageRef = useRef(options.onNewForumMessage);
  const onForumMessageSentRef = useRef(options.onForumMessageSent);
  const onTypingRef = useRef(options.onTyping);
  const onPresenceRef = useRef(options.onPresence);
  const onMessageReadRef = useRef(options.onMessageRead);

  // Update refs when callbacks change
  useEffect(() => {
    onConnectRef.current = options.onConnect;
    onDisconnectRef.current = options.onDisconnect;
    onErrorRef.current = options.onError;
    onNewMessageRef.current = options.onNewMessage;
    onNewForumMessageRef.current = options.onNewForumMessage;
    onForumMessageSentRef.current = options.onForumMessageSent;
    onTypingRef.current = options.onTyping;
    onPresenceRef.current = options.onPresence;
    onMessageReadRef.current = options.onMessageRead;
  });

  // Initialize WebSocket manager only once
  useEffect(() => {
    if (!enabled) return;

    const ws = createChatWebSocketManager();
    wsRef.current = ws;

    // Setup event handlers using refs
    ws.on('connection_state', (state: WSConnectionState) => {
      setConnectionState(state);
      setIsConnected(state === 'connected');

      if (state === 'connected') {
        onConnectRef.current?.();
      } else if (state === 'disconnected') {
        onDisconnectRef.current?.();
      } else if (state === 'error') {
        onErrorRef.current?.(new Error('WebSocket connection error'));
      }
    });

    ws.on('new_message', (data: WSMessage) => {
      if (data.data && onNewMessageRef.current) {
        onNewMessageRef.current(data.data);
      }
    });

    ws.on('new_forum_message', (data: WSMessage) => {
      console.log('[useWebSocket] Received new_forum_message:', data);
      if (data.data && onNewForumMessageRef.current) {
        onNewForumMessageRef.current(data.data);
      }
    });

    ws.on('forum_message_sent', (data: WSMessage) => {
      console.log('[useWebSocket] Received forum_message_sent:', data);
      if (data.data && onForumMessageSentRef.current) {
        onForumMessageSentRef.current(data.data);
      }
    });

    ws.on('typing', (data: WSMessage) => {
      if (data.payload && onTypingRef.current) {
        onTypingRef.current(data.payload);
      }
    });

    ws.on('presence', (data: WSMessage) => {
      if (data.payload && onPresenceRef.current) {
        onPresenceRef.current(data.payload);
      }
    });

    ws.on('message_read', (data: WSMessage) => {
      if (data.payload && onMessageReadRef.current) {
        onMessageReadRef.current(data.payload);
      }
    });

    // Connect
    ws.connect();

    // Cleanup on unmount
    return () => {
      ws.disconnect();
    };
  }, [enabled]); // Only depend on 'enabled', not on callbacks

  // Send message via WebSocket
  const sendMessage = useCallback((content: string, conversationId?: number, groupId?: number, forumId?: number) => {
    if (!wsRef.current?.isConnected()) {
      console.warn('[useWebSocket] WebSocket not connected. Message will be queued.');
    }

    const message = {
      type: 'send_message',
      payload: {
        content,
        conversation_id: conversationId,
        group_id: groupId,
        forum_id: forumId,
      },
    };

    console.log('[useWebSocket] Sending message:', message);
    wsRef.current?.send(message);
  }, []);

  // Join a room (conversation or group)
  const joinRoom = useCallback((roomId: string) => {
    if (!wsRef.current?.isConnected()) {
      console.warn('WebSocket not connected. Cannot join room.');
      return;
    }

    wsRef.current.send({
      type: 'join_room',
      payload: { room_id: roomId },
    });
  }, []);

  // Leave a room
  const leaveRoom = useCallback((roomId: string) => {
    if (!wsRef.current?.isConnected()) {
      return;
    }

    wsRef.current.send({
      type: 'leave_room',
      payload: { room_id: roomId },
    });
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((conversationId?: number, isTyping: boolean = false, forumId?: number) => {
    if (!wsRef.current?.isConnected()) {
      return;
    }

    wsRef.current.send({
      type: 'typing',
      payload: {
        conversation_id: conversationId,
        forum_id: forumId,
        is_typing: isTyping,
      },
    });
  }, []);

  // Mark message as read via WebSocket
  const markAsRead = useCallback((conversationId: number, messageId: number) => {
    if (!wsRef.current?.isConnected()) {
      console.warn('WebSocket not connected. Cannot mark as read via WS.');
      return;
    }

    wsRef.current.send({
      type: 'mark_read',
      payload: {
        conversation_id: conversationId,
        message_id: messageId,
      },
    });
  }, []);

  // Send ping
  const sendPing = useCallback(() => {
    if (!wsRef.current?.isConnected()) {
      return;
    }

    wsRef.current.send({
      type: 'ping',
    });
  }, []);

  return {
    isConnected,
    connectionState,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendTyping,
    markAsRead,
    sendPing,
  };
}

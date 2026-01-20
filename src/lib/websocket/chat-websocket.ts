type WSEventHandler = (data: any) => void;

export type WSConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ChatWebSocketManager {
  connect: () => void;
  disconnect: () => void;
  isConnected: () => boolean;
  send: (data: any) => void;
  on: (event: string, handler: WSEventHandler) => void;
  off: (event: string, handler: WSEventHandler) => void;
  getConnectionState: () => WSConnectionState;
}

class ChatWebSocketManagerImpl implements ChatWebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private eventHandlers: Map<string, Set<WSEventHandler>>;
  private messageQueue: any[] = [];

  constructor(private wsUrl: string) {
    this.eventHandlers = new Map();
  }

  connect() {
    const token = localStorage.getItem('auth_token');
    const url = `${this.wsUrl}?token=${token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;
      this.flushMessageQueue();
      this.emit('connection_state', 'connected');
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log('[WebSocket] Closed', event.code, event.reason);
      this.emit('connection_state', 'disconnected');
      this.scheduleReconnect();
    };

    this.ws.onerror = (error: Event) => {
      console.error('[WebSocket] Error', error);
      this.emit('connection_state', 'error');
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WebSocket] Received message:', data);
        this.emit('message', data);
        if (data.type) {
          console.log('[WebSocket] Emitting event type:', data.type);
          this.emit(data.type, data);
        }
      } catch (e) {
        console.error('[WebSocket] Failed to parse message', e);
      }
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  send(data: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.messageQueue.push(data);
      return;
    }
    this.ws.send(JSON.stringify(data));
  }

  on(event: string, handler: WSEventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: WSEventHandler) {
    this.eventHandlers.get(event)?.delete(handler);
  }

  private emit(event: string, data?: any) {
    this.eventHandlers.get(event)?.forEach(handler => handler(data));
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  private scheduleReconnect() {
    const delays = [1000, 2000, 4000, 8000, 16000];
    const delay = delays[Math.min(this.reconnectAttempts, delays.length - 1)];

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  getConnectionState(): WSConnectionState {
    if (this.ws?.readyState === WebSocket.OPEN) return 'connected';
    if (this.ws?.readyState === WebSocket.CONNECTING) return 'connecting';
    return 'disconnected';
  }
}

export function createChatWebSocketManager(): ChatWebSocketManager {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/v1/ws';
  return new ChatWebSocketManagerImpl(wsUrl);
}

export default createChatWebSocketManager;

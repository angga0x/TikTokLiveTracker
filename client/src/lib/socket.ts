import type { SocketEvents } from '@shared/schema';

export class SocketClient {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private listeners = new Map<keyof SocketEvents, Set<Function>>();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          const handlers = this.listeners.get(type);
          if (handlers) {
            handlers.forEach(handler => handler(data));
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.socket = null;
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  public emit<K extends keyof SocketEvents>(type: K, data: SocketEvents[K]) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  public on<K extends keyof SocketEvents>(type: K, handler: (data: SocketEvents[K]) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

    // Return cleanup function
    return () => {
      const handlers = this.listeners.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  public off<K extends keyof SocketEvents>(type: K, handler?: (data: SocketEvents[K]) => void) {
    if (!handler) {
      this.listeners.delete(type);
    } else {
      const handlers = this.listeners.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listeners.delete(type);
        }
      }
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }

  public get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let socketClient: SocketClient | null = null;

export function getSocketClient(): SocketClient {
  if (!socketClient) {
    socketClient = new SocketClient();
  }
  return socketClient;
}

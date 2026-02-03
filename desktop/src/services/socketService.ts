import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3002';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect() {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    // Re-register all listeners on reconnection
    this.socket.on('connect', () => {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          this.socket?.off(event, callback);
          this.socket?.on(event, callback);
        });
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[Socket] Disconnected');
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Socket event types (must match backend)
export const SocketEvents = {
  INVENTORY_CREATED: 'inventory:created',
  INVENTORY_UPDATED: 'inventory:updated',
  INVENTORY_DELETED: 'inventory:deleted',
  POSTING_STARTED: 'posting:started',
  POSTING_COMPLETED: 'posting:completed',
  POSTING_FAILED: 'posting:failed',
  SYNC_REQUEST: 'sync:request',
  SYNC_COMPLETE: 'sync:complete',
} as const;

export const socketService = new SocketService();
export default socketService;

import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export function initializeSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join shop-specific room if shopId provided
    socket.on('join:shop', (shopId: string) => {
      socket.join(`shop:${shopId}`);
      console.log(`[Socket] ${socket.id} joined shop:${shopId}`);
    });

    socket.on('leave:shop', (shopId: string) => {
      socket.leave(`shop:${shopId}`);
      console.log(`[Socket] ${socket.id} left shop:${shopId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log('[Socket] Socket.io server initialized');
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Emit to all clients in a shop room
export function emitToShop(shopId: string, event: string, data: any) {
  if (io) {
    io.to(`shop:${shopId}`).emit(event, data);
  }
}

// Emit to all connected clients
export function emitToAll(event: string, data: any) {
  if (io) {
    io.emit(event, data);
  }
}

// Event types for type safety
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

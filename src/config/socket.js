import { Server } from 'socket.io';
import { getIdentitySnapshot } from '../modules/identity/store/identity.store.js';

const operationRoom = (operationId) => `operation:${operationId}`;

let io = null;

export const initSocket = (httpServer) => {
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins.length ? corsOrigins : true,
      credentials: true
    },
    // Under /api so nginx `location /api` proxies Socket.IO (root /socket.io often is not proxied).
    path: '/api/socket.io'
  });

  console.log('[identity][socket] initialized path=/api/socket.io cors=', corsOrigins);

  io.on('connection', (socket) => {
    console.log(`[identity][socket] client connected id=${socket.id}`);

    socket.on('identity:subscribe', ({ operationId } = {}) => {
      const id = typeof operationId === 'string' ? operationId.trim() : '';
      if (!id) {
        console.log('[identity][socket] subscribe ignored (empty operationId)');
        return;
      }

      socket.join(operationRoom(id));
      console.log(`[identity][socket] subscribe socket=${socket.id} operationId=${id}`);

      const snapshot = getIdentitySnapshot(id);
      if (snapshot && snapshot.status !== 'pending') {
        console.log(`[identity][socket] replay identity:complete operationId=${id} status=${snapshot.status}`);
        socket.emit('identity:complete', snapshot);
      }
    });

    socket.on('identity:unsubscribe', ({ operationId } = {}) => {
      const id = typeof operationId === 'string' ? operationId.trim() : '';
      if (!id) return;
      socket.leave(operationRoom(id));
      console.log(`[identity][socket] unsubscribe socket=${socket.id} operationId=${id}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[identity][socket] disconnected id=${socket.id} reason=${reason}`);
    });
  });

  return io;
};

export const emitIdentityComplete = (operationId, payload) => {
  if (!io || !operationId) {
    console.log('[identity][socket] emit skipped (no io or operationId)');
    return;
  }
  const room = operationRoom(operationId);
  const clients = io.sockets.adapter.rooms.get(room);
  const count = clients?.size ?? 0;
  console.log(`[identity][socket] emit identity:complete room=${room} listeners=${count}`);
  io.to(room).emit('identity:complete', payload);
};

export const getSocketIo = () => io;

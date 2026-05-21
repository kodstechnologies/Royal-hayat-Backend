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
    path: '/socket.io'
  });

  io.on('connection', (socket) => {
    socket.on('identity:subscribe', ({ operationId } = {}) => {
      const id = typeof operationId === 'string' ? operationId.trim() : '';
      if (!id) return;

      socket.join(operationRoom(id));

      const snapshot = getIdentitySnapshot(id);
      if (snapshot && snapshot.status !== 'pending') {
        socket.emit('identity:complete', snapshot);
      }
    });

    socket.on('identity:unsubscribe', ({ operationId } = {}) => {
      const id = typeof operationId === 'string' ? operationId.trim() : '';
      if (!id) return;
      socket.leave(operationRoom(id));
    });
  });

  return io;
};

export const emitIdentityComplete = (operationId, payload) => {
  if (!io || !operationId) return;
  io.to(operationRoom(operationId)).emit('identity:complete', payload);
};

export const getSocketIo = () => io;

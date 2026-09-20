import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  const token = localStorage.getItem('workflow_token');

  if (!socket || !socket.connected) {
    socket = io('/', {
      auth: {
        token: token || '',
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO Client]: Connected to server with ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO Client Error]:', err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

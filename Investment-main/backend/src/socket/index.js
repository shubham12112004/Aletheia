const { Server } = require('socket.io');
const env = require('../config/env');
const logger = require('../utils/logger');

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id });

    socket.emit('socket:connected', {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { socketId: socket.id, reason });
    });
  });

  return io;
}

function getSocketServer() {
  return io;
}

function emitSocketEvent(event, payload, socketId) {
  if (!io) return;
  if (socketId) io.to(socketId).emit(event, payload);
  else io.emit(event, payload);
}

module.exports = {
  initializeSocket,
  getSocketServer,
  emitSocketEvent,
};

import { Server } from 'socket.io';
import { redisKeys } from './redis.js';

export let io;

export function initSockets(httpServer, clientOrigin) {
  io = new Server(httpServer, {
    cors: { origin: clientOrigin, methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    socket.on('joinAuction', (auctionId) => {
      socket.join(redisKeys.roomAuction(auctionId));
    });
    socket.on('leaveAuction', (auctionId) => {
      socket.leave(redisKeys.roomAuction(auctionId));
    });
    socket.on('joinUser', (userId) => {
      socket.join(redisKeys.roomUser(userId));
    });
  });

  return io;
}

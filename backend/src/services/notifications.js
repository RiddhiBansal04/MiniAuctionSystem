import { Notification } from '../models/index.js';
import { io } from '../sockets.js';
import { redisKeys } from '../redis.js';

export async function pushNotify({ userId, auctionId, message }) {
  const note = await Notification.create({ user_id: userId, auction_id: auctionId, message });
  io.to(redisKeys.roomUser(userId)).emit('notification', note.toJSON());
  return note;
}

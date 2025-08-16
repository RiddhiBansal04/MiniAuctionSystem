import Redis from 'ioredis';
import { config } from './config.js';

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  enableAutoPipelining: true
});

export const redisKeys = {
  highestBid: (auctionId) => `auction:${auctionId}:highestBid`,
  roomAuction: (auctionId) => `room:auction:${auctionId}`,
  roomUser: (userId) => `room:user:${userId}`
};

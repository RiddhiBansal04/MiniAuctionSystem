import { Auction, Bid } from './models/index.js';
import { redis, redisKeys } from './redis.js';
import { pushNotify } from './services/notifications.js';

export function startScheduler(io) {
  setInterval(async () => {
    const now = new Date();

    // Activate auctions
    const toActivate = await Auction.findAll({ where: { status: 'scheduled' } });
    for (const a of toActivate) {
      if (new Date(a.start_time) <= now) {
        a.status = 'active';
        await a.save();
        io.to(redisKeys.roomAuction(a.id)).emit('auction:status', { auctionId: a.id, status: a.status });
      }
    }

    // End auctions
    const active = await Auction.findAll({ where: { status: 'active' } });
    for (const a of active) {
      if (new Date(a.end_time) <= now) {
        a.status = 'awaiting_seller';
        await a.save();

        const top = await Bid.findOne({ where: { auction_id: a.id }, order: [['bid_amount','DESC']] });
        if (top) {
          await redis.set(redisKeys.highestBid(a.id), top.bid_amount);
          await pushNotify({ userId: a.seller_id, auctionId: a.id, message: `Auction ended. Highest bid ₹${top.bid_amount}` });
          await pushNotify({ userId: top.bidder_id, auctionId: a.id, message: `You are highest bidder. Await seller decision.` });
        } else {
          await pushNotify({ userId: a.seller_id, auctionId: a.id, message: `Auction ended with no bids.` });
        }
        io.to(redisKeys.roomAuction(a.id)).emit('auction:status', { auctionId: a.id, status: a.status });
      }
    }
  }, 5000);
}

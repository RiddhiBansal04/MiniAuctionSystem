import express from 'express';
import { Auction, Bid } from '../models/index.js';
import { auth } from '../middleware/auth.js';
import { redis, redisKeys } from '../redis.js';
import { nextMinimumBid } from '../utils/money.js';
import { pushNotify } from '../services/notifications.js';
import { io } from '../sockets.js';

const router = express.Router();

// Place a bid
router.post('/:auctionId', auth(), async (req, res) => {
  const { auctionId } = req.params;
  const { bid_amount } = req.body;
  const auction = await Auction.findByPk(auctionId);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });
  if (auction.status !== 'active') return res.status(400).json({ error: 'Auction not active' });

  const redisKey = redisKeys.highestBid(auctionId);
  let highest = Number(await redis.get(redisKey)) || 0;
  if (!highest) {
    const maxBid = await Bid.max('bid_amount', { where: { auction_id: auctionId } });
    highest = Number(maxBid) || 0;
  }
  const minNext = nextMinimumBid({
    starting_price: auction.starting_price,
    bid_increment: auction.bid_increment,
    currentHighest: highest
  });
  if (bid_amount < minNext) return res.status(400).json({ error: `Bid must be >= ${minNext}` });

  const prevHighest = await Bid.findOne({ where: { auction_id: auctionId }, order: [['bid_amount','DESC']] });

  const bid = await Bid.create({ auction_id: auctionId, bidder_id: req.user.id, bid_amount });
  await redis.set(redisKey, bid_amount);

  io.to(redisKeys.roomAuction(auctionId)).emit('bid:new', {
    auctionId,
    bid: bid.toJSON(),
    highestBid: bid_amount,
    nextMinimum: bid_amount + auction.bid_increment
  });

  await pushNotify({ userId: auction.seller_id, auctionId, message: `New bid ₹${bid_amount} on ${auction.item_name}` });

  if (prevHighest && prevHighest.bidder_id !== req.user.id) {
    await pushNotify({ userId: prevHighest.bidder_id, auctionId, message: `You were outbid on ${auction.item_name} (₹${bid_amount})` });
  }

  res.json({ success: true, bid });
});

export default router;

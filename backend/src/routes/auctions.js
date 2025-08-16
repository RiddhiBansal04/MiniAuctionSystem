import express from 'express';
import { Auction, Bid, User } from '../models/index.js';
import { auth } from '../middleware/auth.js';
import { redis, redisKeys } from '../redis.js';
import { nextMinimumBid } from '../utils/money.js';

const router = express.Router();

// Create auction (seller only)
router.post('/', auth(), async (req, res) => {
  const { item_name, description, starting_price, bid_increment, start_time, duration_minutes } = req.body;
  const start = new Date(start_time);
  const end = new Date(start.getTime() + (duration_minutes || 10) * 60 * 1000);
  const auction = await Auction.create({
    seller_id: req.user.id,
    item_name,
    description,
    starting_price,
    bid_increment,
    start_time: start,
    end_time: end,
    status: 'scheduled'
  });
  res.json(auction);
});

// List all auctions
router.get('/', async (req, res) => {
  const list = await Auction.findAll({
    order: [['created_at', 'DESC']],
    include: [{ model: User, as: 'seller', attributes: ['id', 'name'] }]
  });
  res.json(list);
});

// Get auction details
router.get('/:id', async (req, res) => {
  const auction = await Auction.findByPk(req.params.id, {
    include: [{ model: User, as: 'seller', attributes: ['id', 'name'] }]
  });
  if (!auction) return res.status(404).json({ error: 'Not found' });

  const redisKey = redisKeys.highestBid(auction.id);
  let highest = await redis.get(redisKey);
  if (!highest) {
    const maxBid = await Bid.max('bid_amount', { where: { auction_id: auction.id } });
    highest = maxBid || 0;
    await redis.set(redisKey, highest);
  }
  const minNext = nextMinimumBid({
    starting_price: auction.starting_price,
    bid_increment: auction.bid_increment,
    currentHighest: Number(highest)
  });
  res.json({ auction, highestBid: Number(highest), nextMinimum: minNext });
});

export default router;

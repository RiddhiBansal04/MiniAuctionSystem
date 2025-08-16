import express from 'express';
import { Auction, Bid, CounterOffer, User } from '../models/index.js';
import { auth } from '../middleware/auth.js';
import { pushNotify } from '../services/notifications.js';
import { sendEmail } from '../services/email.js';
import { generateInvoice } from '../services/invoice.js';

const router = express.Router();

async function ensureOwner(userId, auctionId) {
  const a = await Auction.findByPk(auctionId);
  if (!a) throw new Error('Not found');
  if (a.seller_id !== userId) throw new Error('Forbidden');
  return a;
}

router.post('/:auctionId/accept', auth(), async (req, res) => {
  try {
    const auction = await ensureOwner(req.user.id, req.params.auctionId);
    const top = await Bid.findOne({
      where: { auction_id: auction.id },
      order: [['bid_amount', 'DESC']],
      include: [{ model: User, as: 'bidder' }]
    });
    if (!top) return res.status(400).json({ error: 'No bids' });
    auction.status = 'closed';
    await auction.save();

    const seller = await User.findByPk(auction.seller_id);
    const buyer = await User.findByPk(top.bidder_id);

    const invoicePath = generateInvoice({ auction, buyer, seller, amount: top.bid_amount });

    await sendEmail({ to: buyer.email, subject: 'Bid Accepted', text: `Your bid on ${auction.item_name} is accepted` });
    await sendEmail({ to: seller.email, subject: 'Sale Confirmed', text: `You accepted ₹${top.bid_amount} for ${auction.item_name}` });

    await pushNotify({ userId: buyer.id, auctionId: auction.id, message: `Your bid accepted (₹${top.bid_amount})` });

    res.json({ success: true, auction, invoicePath });
  } catch (e) {
    const code = e.message === 'Forbidden' ? 403 : (e.message === 'Not found' ? 404 : 400);
    res.status(code).json({ error: e.message });
  }
});

router.post('/:auctionId/reject', auth(), async (req, res) => {
  try {
    const auction = await ensureOwner(req.user.id, req.params.auctionId);
    auction.status = 'closed';
    await auction.save();
    const top = await Bid.findOne({ where: { auction_id: auction.id }, order: [['bid_amount', 'DESC']] });
    if (top) await pushNotify({ userId: top.bidder_id, auctionId: auction.id, message: `Seller rejected your highest bid` });
    res.json({ success: true });
  } catch (e) {
    const code = e.message === 'Forbidden' ? 403 : (e.message === 'Not found' ? 404 : 400);
    res.status(code).json({ error: e.message });
  }
});

router.post('/:auctionId/counter', auth(), async (req, res) => {
  try {
    const { amount } = req.body;
    const auction = await ensureOwner(req.user.id, req.params.auctionId);
    const top = await Bid.findOne({ where: { auction_id: auction.id }, order: [['bid_amount', 'DESC']] });
    if (!top) return res.status(400).json({ error: 'No bids' });
    const offer = await CounterOffer.create({ auction_id: auction.id, buyer_id: top.bidder_id, amount });
    await pushNotify({ userId: top.bidder_id, auctionId: auction.id, message: `Seller counter-offered ₹${amount}` });
    res.json({ success: true, offer });
  } catch (e) {
    const code = e.message === 'Forbidden' ? 403 : (e.message === 'Not found' ? 404 : 400);
    res.status(code).json({ error: e.message });
  }
});

router.post('/counter/:offerId/respond', auth(), async (req, res) => {
  const { decision } = req.body;
  const offer = await CounterOffer.findByPk(req.params.offerId);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  if (offer.buyer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const auction = await Auction.findByPk(offer.auction_id);
  const seller = await User.findByPk(auction.seller_id);
  const buyer = await User.findByPk(offer.buyer_id);

  if (decision === 'accept') {
    offer.status = 'accepted';
    await offer.save();
    auction.status = 'closed';
    await auction.save();

    generateInvoice({ auction, buyer, seller, amount: offer.amount });

    await pushNotify({ userId: seller.id, auctionId: auction.id, message: `Buyer accepted counter-offer (₹${offer.amount})` });
    await pushNotify({ userId: buyer.id, auctionId: auction.id, message: `Counter-offer accepted` });
    await sendEmail({ to: buyer.email, subject: 'Purchase Confirmed', text: `Counter-offer accepted for ${auction.item_name}` });
    await sendEmail({ to: seller.email, subject: 'Sale Confirmed', text: `Buyer accepted your counter-offer` });

    return res.json({ success: true, offer });
  } else {
    offer.status = 'rejected';
    await offer.save();
    await pushNotify({ userId: seller.id, auctionId: auction.id, message: `Buyer rejected your counter-offer` });
    await pushNotify({ userId: buyer.id, auctionId: auction.id, message: `You rejected the counter-offer` });
    return res.json({ success: true, offer });
  }
});

export default router;

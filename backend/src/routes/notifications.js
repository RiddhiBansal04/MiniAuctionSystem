import express from 'express';
import { Notification } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all notifications for user
router.get('/', auth(), async (req, res) => {
  const notes = await Notification.findAll({
    where: { user_id: req.user.id },
    order: [['created_at', 'DESC']]
  });
  res.json(notes);
});

// Mark as read
router.post('/:id/read', auth(), async (req, res) => {
  const note = await Notification.findByPk(req.params.id);
  if (!note || note.user_id !== req.user.id) return res.status(404).json({ error: 'Not found' });
  note.read = true;
  await note.save();
  res.json({ success: true });
});

export default router;

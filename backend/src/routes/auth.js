import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { sign, auth } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password_hash, role });
  const token = sign(user);
  res.json({ token, user });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = sign(user);
  res.json({ token, user });
});

// Get current user
router.get('/me', auth(), async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json(user);
});

export default router;

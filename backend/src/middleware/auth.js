import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function sign(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

export function auth(required = true) {
  return (req, res, next) => {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return required ? res.status(401).json({ error: 'Unauthorized' }) : next();
    try {
      req.user = jwt.verify(token, config.jwtSecret);
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

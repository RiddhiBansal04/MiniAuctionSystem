import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { connectDB } from './db.js';
import { sync } from './models/index.js';
import { initSockets } from './sockets.js';
import { startScheduler } from './scheduler.js';

import authRoutes from './routes/auth.js';
import auctionRoutes from './routes/auctions.js';
import bidRoutes from './routes/bids.js';
import sellerRoutes from './routes/seller.js';
import noteRoutes from './routes/notifications.js';

const app = express();
app.use(helmet());

app.use(cors({
  origin: [
    "http://localhost:5173",         
    "https://your-frontend.onrender.com" 
  ],
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/notifications', noteRoutes);

const server = http.createServer(app);
const io = initSockets(server, config.clientOrigin);

start();

async function start() {
  await connectDB();
  await sync();
  startScheduler(io);
  server.listen(config.port, () => console.log(`API running on port ${config.port}`));
}

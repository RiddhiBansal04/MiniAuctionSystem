import { sequelize } from '../db.js';
import { DataTypes } from 'sequelize';

export const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password_hash: DataTypes.STRING,
  role: { type: DataTypes.ENUM('buyer', 'seller', 'admin'), defaultValue: 'buyer' }
});

export const Auction = sequelize.define('Auction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  item_name: DataTypes.STRING,
  description: DataTypes.TEXT,
  starting_price: DataTypes.INTEGER,
  bid_increment: DataTypes.INTEGER,
  start_time: DataTypes.DATE,
  end_time: DataTypes.DATE,
  status: { type: DataTypes.ENUM('scheduled', 'active', 'awaiting_seller', 'closed'), defaultValue: 'scheduled' }
});

export const Bid = sequelize.define('Bid', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  bid_amount: DataTypes.INTEGER
});

export const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  message: DataTypes.STRING,
  read: { type: DataTypes.BOOLEAN, defaultValue: false }
});

export const CounterOffer = sequelize.define('CounterOffer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  amount: DataTypes.INTEGER,
  status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected'), defaultValue: 'pending' }
});

// Associations
User.hasMany(Auction, { foreignKey: 'seller_id' });
Auction.belongsTo(User, { as: 'seller', foreignKey: 'seller_id' });

Auction.hasMany(Bid, { foreignKey: 'auction_id' });
Bid.belongsTo(Auction, { foreignKey: 'auction_id' });
Bid.belongsTo(User, { as: 'bidder', foreignKey: 'bidder_id' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });
Notification.belongsTo(Auction, { foreignKey: 'auction_id' });

Auction.hasOne(CounterOffer, { foreignKey: 'auction_id' });
CounterOffer.belongsTo(Auction, { foreignKey: 'auction_id' });
CounterOffer.belongsTo(User, { as: 'buyer', foreignKey: 'buyer_id' });

export async function sync({ force = false } = {}) {
  await sequelize.sync({ force, alter: !force });
}

if (process.argv[2] === 'migrate') {
  sync().then(() => { console.log('DB synced'); process.exit(0); })
      .catch((e) => { console.error(e); process.exit(1); });
}

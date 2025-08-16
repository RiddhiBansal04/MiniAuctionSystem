import { Sequelize } from 'sequelize';
import { config } from './config.js';

export const sequelize = new Sequelize(config.dbUrl, {
  dialect: 'postgres',
  logging: false,
  define: { underscored: true }
});

export async function connectDB() {
  await sequelize.authenticate();
}

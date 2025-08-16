import 'dotenv/config';

export const config = {
  port: process.env.PORT || 8080,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  clientOrigin: process.env.CLIENT_ORIGIN,
  dbUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  sendgridKey: process.env.SENDGRID_API_KEY,
  emailFrom: process.env.EMAIL_FROM || 'riddhiybansal04@gmail.com',
  invoicePath: process.env.INVOICE_BUCKET_PATH || './invoices'
};

if (!config.dbUrl) throw new Error('DATABASE_URL required');
if (!config.jwtSecret) throw new Error('JWT_SECRET required');

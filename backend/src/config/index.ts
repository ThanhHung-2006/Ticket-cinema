import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ticket_cinema?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'ticket_cinema_default_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  seatHoldMinutes: parseInt(process.env.SEAT_HOLD_DURATION_MINUTES || '5', 10),
};

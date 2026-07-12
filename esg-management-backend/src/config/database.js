import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from './logger.js';

let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

/**
 * Connect to MongoDB with retry logic
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    retryCount = 0; // reset counter on success
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.info(`Retrying connection to MongoDB in ${RETRY_INTERVAL_MS / 1000}s... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(connectDB, RETRY_INTERVAL_MS);
    } else {
      logger.error('Max MongoDB connection retries reached. Exiting process.');
      process.exit(1);
    }
  }
};

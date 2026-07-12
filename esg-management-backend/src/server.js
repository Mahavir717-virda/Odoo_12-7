import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/database.js';
import { logger } from './config/logger.js';

let server;

// Start database connection
connectDB();

// Listen to port
server = app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port} in ${config.env} mode`);
});

// Setup error logging handlers for unhandled rejections and uncaught exceptions
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('Unexpected error: ', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

// Signal termination handler for clean graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

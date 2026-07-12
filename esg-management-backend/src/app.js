import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { config } from './config/env.js';
import { logger } from './config/logger.js';
import routes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Set HTTP security headers
app.use(helmet());

// Logging middleware configuration
if (config.env !== 'test') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Gzip compression middleware
app.use(compression());

// Enable CORS
app.use(cors());

// Mount central API router under /api/v1 prefix
app.use('/api/v1', routes);

// Fallback to 404 handler for any unmapped route request
app.use(notFound);

// Central error handler
app.use(errorHandler);

export default app;

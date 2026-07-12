import mongoose from 'mongoose';
import { logger } from '../config/logger.js';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * Global Error handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(config.env === 'development' && { stack: error.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  } else {
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  res.status(error.statusCode).json(response);
};

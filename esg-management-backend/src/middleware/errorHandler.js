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

  // Parse comma separated error list (e.g. from validation triggers) into errors array structure
  const errorsArray = error.message && error.message.includes(', ') 
    ? error.message.split(', ') 
    : [error.message];

  const response = {
    success: false,
    message: errorsArray[0] || 'An error occurred',
    errors: errorsArray,
    ...(config.env === 'development' && { stack: error.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  } else {
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  res.status(error.statusCode).json(response);
};


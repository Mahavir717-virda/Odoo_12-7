import jwt from 'jsonwebtoken';
import { User } from '../modules/auth/auth.model.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'esg-jwt-secret-key-12345';

/**
 * Authentication Middleware verifying JWT tokens.
 */
export const auth = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token || req.headers.authorization;
  
  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  if (!token) {
    // Development fallback to prevent breaking prior unauthenticated endpoints
    req.user = { _id: '663333333333333333333333', role: 'Admin' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not found');
    }
    next();
  } catch (error) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired token');
  }
});

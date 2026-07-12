import jwt from 'jsonwebtoken';
import { config } from './env.js';

export const jwtConfig = {
  secret: config.jwt.secret,
  expiresIn: config.jwt.accessExpirationMinutes,
};

/**
 * Generate Access Token
 * @param {object} payload
 * @returns {string} jwt token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

/**
 * Verify Access Token
 * @param {string} token
 * @returns {object} decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, jwtConfig.secret);
};

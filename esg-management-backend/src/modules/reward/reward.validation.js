import { body, param, query } from 'express-validator';
import { ALLOWED_REWARD_TYPES } from './reward.constants.js';

export const createRewardValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Reward name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Reward name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('rewardType')
    .optional()
    .isIn(ALLOWED_REWARD_TYPES)
    .withMessage(`Reward type must be one of: ${ALLOWED_REWARD_TYPES.join(', ')}`),
  body('requiredPoints')
    .isInt({ min: 0 })
    .withMessage('Required points must be a positive integer'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a positive integer'),
  body('image')
    .optional()
    .trim(),
  body('expiryDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO8601 date'),
];

export const redeemRewardValidation = [
  body('rewardId')
    .isMongoId()
    .withMessage('Invalid reward ID format'),
  body('employeeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid employee ID format'),
];

export const getRedemptionByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid redemption ID format'),
];

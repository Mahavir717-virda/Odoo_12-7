import { body, param, query } from 'express-validator';
import { ALLOWED_BADGE_CATEGORIES } from './badge.constants.js';

export const createBadgeValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Badge name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Badge name must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('category')
    .isIn(ALLOWED_BADGE_CATEGORIES)
    .withMessage(`Category must be one of: ${ALLOWED_BADGE_CATEGORIES.join(', ')}`),
  body('icon')
    .optional()
    .trim(),
  body('badgeColor')
    .optional()
    .trim(),
  body('xpRequired')
    .optional()
    .isInt({ min: 0 })
    .withMessage('XP requirement must be a positive integer'),
  body('challengeRequired')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Challenge requirement must be a positive integer'),
];

export const getBadgeProfileValidation = [
  query('employeeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid employee ID format'),
];

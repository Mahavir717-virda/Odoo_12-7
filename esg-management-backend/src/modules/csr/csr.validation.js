import { body, param, query } from 'express-validator';
import { ALLOWED_STATUSES, ALLOWED_CATEGORIES } from './csr.constants.js';

export const createCSRValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('CSR title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('CSR title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('CSR description is required'),
  body('category')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_CATEGORIES)
    .withMessage(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`),
  body('points')
    .notEmpty()
    .withMessage('Points allocation is required')
    .isInt({ min: 0 })
    .withMessage('Points must be a positive integer'),
  body('evidenceRequired')
    .optional()
    .isBoolean()
    .withMessage('evidenceRequired must be a boolean'),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),
];

export const updateCSRValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid CSR ID format'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('CSR title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_CATEGORIES)
    .withMessage(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`),
  body('points')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Points must be a positive integer'),
  body('evidenceRequired')
    .optional()
    .isBoolean()
    .withMessage('evidenceRequired must be a boolean'),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),
];

export const getCSRByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid CSR ID format'),
];

export const queryCSRsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),
  query('category')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_CATEGORIES)
    .withMessage(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`),
];

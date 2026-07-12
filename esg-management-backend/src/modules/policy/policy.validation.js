import { body, param, query } from 'express-validator';
import { ALLOWED_POLICY_CATEGORIES, ALLOWED_POLICY_STATUSES } from './policy.constants.js';

export const createPolicyValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),
  body('policyNumber')
    .trim()
    .notEmpty()
    .withMessage('Policy number is required'),
  body('category')
    .isIn(ALLOWED_POLICY_CATEGORIES)
    .withMessage(`Category must be one of: ${ALLOWED_POLICY_CATEGORIES.join(', ')}`),
  body('effectiveDate')
    .isISO8601()
    .withMessage('Effective date must be a valid ISO8601 date'),
  body('mandatory')
    .optional()
    .isBoolean()
    .withMessage('Mandatory must be a boolean'),
  body('status')
    .optional()
    .isIn(ALLOWED_POLICY_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_POLICY_STATUSES.join(', ')}`),
];

export const updatePolicyValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid policy ID format'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),
  body('status')
    .optional()
    .isIn(ALLOWED_POLICY_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_POLICY_STATUSES.join(', ')}`),
];

export const getPolicyByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid policy ID format'),
];

export const acknowledgePolicyValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid policy ID format'),
  body('employeeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid employee ID format'),
];

export const queryPoliciesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }),
];

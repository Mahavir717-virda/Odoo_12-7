import { body, param, query } from 'express-validator';
import { ALLOWED_STATUSES } from './participation.constants.js';

export const joinActivityValidation = [
  body('activityId')
    .isMongoId()
    .withMessage('Invalid CSR activity ID format'),
  body('employeeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid employee ID format'),
];

export const approveParticipationValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid participation ID format'),
  body('adminId')
    .optional()
    .isMongoId()
    .withMessage('Invalid admin ID format'),
];

export const rejectParticipationValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid participation ID format'),
  body('rejectionReason')
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is required'),
  body('adminId')
    .optional()
    .isMongoId()
    .withMessage('Invalid admin ID format'),
];

export const getParticipationByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid participation ID format'),
];

export const queryParticipationsValidation = [
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
  query('employee')
    .optional()
    .isMongoId()
    .withMessage('Invalid employee ID format'),
  query('activity')
    .optional()
    .isMongoId()
    .withMessage('Invalid activity ID format'),
];

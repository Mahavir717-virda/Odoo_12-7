import { body, param, query } from 'express-validator';
import { ALLOWED_AUDIT_STATUSES, ALLOWED_SEVERITIES, ALLOWED_PRIORITIES } from './audit.constants.js';

export const scheduleAuditValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Audit name is required'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Audit type is required'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('auditor')
    .optional()
    .trim(),
  body('auditorName')
    .optional()
    .trim(),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO8601 date'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date'),
];

export const addFindingValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid audit ID format'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Finding title is required'),
  body('severity')
    .optional()
    .isIn(ALLOWED_SEVERITIES)
    .withMessage(`Severity must be one of: ${ALLOWED_SEVERITIES.join(', ')}`),
];

export const assignCorrectiveActionValidation = [
  body('findingId')
    .isMongoId()
    .withMessage('Invalid finding ID format'),
  body('assignedTo')
    .isMongoId()
    .withMessage('Invalid employee assignment ID format'),
  body('action')
    .trim()
    .notEmpty()
    .withMessage('Action description is required'),
  body('priority')
    .optional()
    .isIn(ALLOWED_PRIORITIES)
    .withMessage(`Priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}`),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date'),
];

export const getAuditByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid audit ID format'),
];

export const resolveCorrectiveActionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid corrective action ID format'),
];

export const verifyCorrectiveActionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid corrective action ID format'),
  body('status')
    .isIn(['Verified', 'Pending'])
    .withMessage('Status must be Verified or Pending'),
];

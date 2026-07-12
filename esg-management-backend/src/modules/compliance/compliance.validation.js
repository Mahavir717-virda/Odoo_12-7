import { body, param, query } from 'express-validator';
import { ALLOWED_COMPLIANCE_SOURCES, ALLOWED_SEVERITIES, ALLOWED_PRIORITIES } from './compliance.constants.js';

export const createComplianceValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Compliance title is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('source')
    .isIn(ALLOWED_COMPLIANCE_SOURCES)
    .withMessage(`Source must be one of: ${ALLOWED_COMPLIANCE_SOURCES.join(', ')}`),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date'),
  body('severity')
    .optional()
    .isIn(ALLOWED_SEVERITIES)
    .withMessage('Invalid severity value'),
  body('priority')
    .optional()
    .isIn(ALLOWED_PRIORITIES)
    .withMessage('Invalid priority value'),
];

export const getComplianceByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid compliance ID format'),
];

export const assignComplianceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid compliance ID format'),
  body('employeeId')
    .isMongoId()
    .withMessage('Invalid employee ID format'),
  body('adminId')
    .optional()
    .isMongoId()
    .withMessage('Invalid admin ID format'),
];

export const progressUpdateValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid compliance ID format'),
  body('progress')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be an integer between 0 and 100'),
  body('remarks')
    .trim()
    .notEmpty()
    .withMessage('Remarks/notes are required'),
  body('employeeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid employee ID format'),
];

export const verifyComplianceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid compliance ID format'),
  body('status')
    .isIn(['Closed', 'In Progress'])
    .withMessage('Status must be Closed or In Progress'),
  body('remarks')
    .optional()
    .trim(),
  body('adminId')
    .optional()
    .isMongoId()
    .withMessage('Invalid admin ID format'),
];

export const queryCompliancesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }),
];

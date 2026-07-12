import { body, param, query } from 'express-validator';
import { ALLOWED_STATUSES } from './department.constants.js';

export const createDepartmentValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Department name must be between 3 and 100 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Department code is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Department code must be between 2 and 10 characters')
    .toUpperCase(),
  body('description')
    .optional()
    .trim(),
  body('head')
    .optional({ nullable: true })
    .trim(),
  body('parentDepartment')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid parent department ID format'),
  body('employeeCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Employee count must be a positive integer'),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),
];

export const updateDepartmentValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid department ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Department name must be between 3 and 100 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Department code must be between 2 and 10 characters')
    .toUpperCase(),
  body('description')
    .optional()
    .trim(),
  body('head')
    .optional({ nullable: true })
    .trim(),
  body('parentDepartment')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid parent department ID format'),
  body('employeeCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Employee count must be a positive integer'),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),
];

export const getDepartmentByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid department ID format'),
];

export const queryDepartmentsValidation = [
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
  query('parentDepartment')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent department ID format'),
];

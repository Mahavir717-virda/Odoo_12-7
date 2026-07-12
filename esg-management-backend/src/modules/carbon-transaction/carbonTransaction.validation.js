import { body, param, query } from 'express-validator';
import {
  ALLOWED_ACTIVITY_TYPES,
  ALLOWED_APPROVAL_STATUSES,
  ALLOWED_TRANSACTION_STATUSES,
  ALLOWED_CALCULATION_METHODS,
} from './carbonTransaction.constants.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

// Whitelisted body payload fields
const ALLOWED_FIELDS = [
  'department',
  'productESGProfile',
  'activityType',
  'activityReference',
  'quantity',
  'unit',
  'emissionFactorValue',
  'calculatedEmission',
  'calculationMethod',
  'transactionDate',
  'remarks',
  'approvalStatus',
  'approvedBy',
  'status',
  'createdBy',
  'updatedBy',
];

/**
 * Middleware to reject any un-whitelisted fields in the request body (Preventing Mass Assignment)
 */
export const preventMassAssignment = (req, res, next) => {
  const incomingFields = Object.keys(req.body);
  const unknownFields = incomingFields.filter((field) => !ALLOWED_FIELDS.includes(field));

  if (unknownFields.length > 0) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, `Rejecting unknown fields in request body: ${unknownFields.join(', ')}`));
  }
  next();
};

export const createTransactionValidation = [
  body('department')
    .notEmpty()
    .withMessage('Department ID is required')
    .isMongoId()
    .withMessage('Department must be a valid Mongo ID'),
  body('productESGProfile')
    .notEmpty()
    .withMessage('Product ESG Profile ID is required')
    .isMongoId()
    .withMessage('Product ESG Profile must be a valid Mongo ID'),
  body('activityType')
    .notEmpty()
    .withMessage('Activity type is required')
    .toUpperCase()
    .isIn(ALLOWED_ACTIVITY_TYPES)
    .withMessage(`Activity type must be one of: ${ALLOWED_ACTIVITY_TYPES.join(', ')}`),
  body('activityReference')
    .optional()
    .trim(),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ gt: 0 })
    .withMessage('Quantity must be a positive float greater than 0'),
  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .trim(),
  body('calculationMethod')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_CALCULATION_METHODS)
    .withMessage(`Calculation method must be one of: ${ALLOWED_CALCULATION_METHODS.join(', ')}`),
  body('emissionFactorValue')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('emissionFactorValue must be greater than zero'),
  body('calculatedEmission')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('calculatedEmission must be a positive number'),
  body('transactionDate')
    .notEmpty()
    .withMessage('Transaction date is required')
    .isISO8601()
    .withMessage('transactionDate must be a valid ISO8601 Date'),
  body('remarks')
    .optional()
    .trim(),
  body('approvalStatus')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_APPROVAL_STATUSES)
    .withMessage(`Approval status must be one of: ${ALLOWED_APPROVAL_STATUSES.join(', ')}`),
  body('approvedBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid approvedBy User ID format'),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_TRANSACTION_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_TRANSACTION_STATUSES.join(', ')}`),
  body('createdBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid creator User ID format'),
];

export const updateTransactionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid transaction ID format'),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Department must be a valid Mongo ID'),
  body('productESGProfile')
    .optional()
    .isMongoId()
    .withMessage('Product ESG Profile must be a valid Mongo ID'),
  body('activityType')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_ACTIVITY_TYPES)
    .withMessage(`Activity type must be one of: ${ALLOWED_ACTIVITY_TYPES.join(', ')}`),
  body('activityReference')
    .optional()
    .trim(),
  body('quantity')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Quantity must be a positive float greater than 0'),
  body('unit')
    .optional()
    .trim(),
  body('calculationMethod')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_CALCULATION_METHODS)
    .withMessage(`Calculation method must be one of: ${ALLOWED_CALCULATION_METHODS.join(', ')}`),
  body('emissionFactorValue')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('emissionFactorValue must be greater than zero'),
  body('calculatedEmission')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('calculatedEmission must be a positive number'),
  body('transactionDate')
    .optional()
    .isISO8601()
    .withMessage('transactionDate must be a valid ISO8601 Date'),
  body('remarks')
    .optional()
    .trim(),
  body('approvalStatus')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_APPROVAL_STATUSES)
    .withMessage(`Approval status must be one of: ${ALLOWED_APPROVAL_STATUSES.join(', ')}`),
  body('approvedBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid approvedBy User ID format'),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_TRANSACTION_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_TRANSACTION_STATUSES.join(', ')}`),
  body('updatedBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid updater User ID format'),
];

export const getTransactionByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid transaction ID format'),
];

export const queryTransactionsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('department')
    .optional()
    .isMongoId()
    .withMessage('Department filter must be a valid Mongo ID'),
  query('product')
    .optional()
    .isMongoId()
    .withMessage('Product filter must be a valid Mongo ID'),
  query('activityType')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_ACTIVITY_TYPES)
    .withMessage(`Activity type filter must be one of: ${ALLOWED_ACTIVITY_TYPES.join(', ')}`),
  query('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_TRANSACTION_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_TRANSACTION_STATUSES.join(', ')}`),
  query('approvalStatus')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_APPROVAL_STATUSES)
    .withMessage(`Approval status filter must be one of: ${ALLOWED_APPROVAL_STATUSES.join(', ')}`),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate filter must be a valid ISO8601 Date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate filter must be a valid ISO8601 Date'),
  query('sortBy')
    .optional()
    .isIn(['transactionDate', 'calculatedEmission', 'createdAt'])
    .withMessage('Sort by field must be transactionDate, calculatedEmission, or createdAt'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

export const queryAggregationsValidation = [
  query('department')
    .optional()
    .isMongoId()
    .withMessage('Department filter must be a valid Mongo ID'),
  query('activityType')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_ACTIVITY_TYPES)
    .withMessage(`Activity type filter must be one of: ${ALLOWED_ACTIVITY_TYPES.join(', ')}`),
  query('approvalStatus')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_APPROVAL_STATUSES)
    .withMessage(`Approval status filter must be one of: ${ALLOWED_APPROVAL_STATUSES.join(', ')}`),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate filter must be a valid ISO8601 Date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate filter must be a valid ISO8601 Date'),
];

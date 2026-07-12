import { body, param, query } from 'express-validator';
import { ALLOWED_CATEGORY_TYPES, ALLOWED_CATEGORY_STATUSES } from './category.constants.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

// Whitelisted body payload fields
const ALLOWED_FIELDS = ['name', 'description', 'type', 'status', 'color', 'icon', 'sortOrder', 'createdBy', 'updatedBy', 'scoreWeight'];

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

export const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Category name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Category description cannot exceed 500 characters'),
  body('type')
    .notEmpty()
    .withMessage('Category type is required')
    .toUpperCase()
    .isIn(ALLOWED_CATEGORY_TYPES)
    .withMessage(`Type must be one of: ${ALLOWED_CATEGORY_TYPES.join(', ')}`),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_CATEGORY_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_CATEGORY_STATUSES.join(', ')}`),
  body('scoreWeight')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score weight must be an integer between 0 and 100'),
  body('color')
    .trim()
    .notEmpty()
    .withMessage('Color is required')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code (e.g. #4CAF50)'),
  body('icon')
    .optional()
    .trim(),
  body('sortOrder')
    .optional()
    .isInt()
    .withMessage('Sort order must be an integer'),
  body('createdBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid creator User ID format'),
];

export const updateCategoryValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Category name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Category description cannot exceed 500 characters'),
  body('type')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_CATEGORY_TYPES)
    .withMessage(`Type must be one of: ${ALLOWED_CATEGORY_TYPES.join(', ')}`),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_CATEGORY_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_CATEGORY_STATUSES.join(', ')}`),
  body('scoreWeight')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score weight must be an integer between 0 and 100'),
  body('color')
    .optional()
    .trim()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code (e.g. #4CAF50)'),
  body('icon')
    .optional()
    .trim(),
  body('sortOrder')
    .optional()
    .isInt()
    .withMessage('Sort order must be an integer'),
  body('updatedBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid updater User ID format'),
];

export const getCategoryByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID format'),
];

export const queryCategoriesValidation = [
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
    .isIn(ALLOWED_CATEGORY_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_CATEGORY_STATUSES.join(', ')}`),
  query('type')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_CATEGORY_TYPES)
    .withMessage(`Type must be one of: ${ALLOWED_CATEGORY_TYPES.join(', ')}`),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 date format'),
  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'sortOrder'])
    .withMessage('Sort by field must be name, createdAt, or sortOrder'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

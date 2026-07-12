import { body, param, query } from 'express-validator';
import {
  ALLOWED_GOAL_TYPES,
  ALLOWED_GOAL_PRIORITIES,
  ALLOWED_GOAL_STATUSES,
  ALLOWED_ACHIEVEMENT_STATUSES,
} from './goal.constants.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

// Whitelisted body payload fields
const ALLOWED_FIELDS = [
  'goalCode',
  'title',
  'description',
  'department',
  'goalType',
  'baselineValue',
  'targetValue',
  'currentValue',
  'unit',
  'startDate',
  'targetDate',
  'priority',
  'status',
  'autoTrack',
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

export const createGoalValidation = [
  body('goalCode')
    .trim()
    .notEmpty()
    .withMessage('Goal code is required')
    .toUpperCase(),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('department')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Department must be a valid Mongo ID'),
  body('goalType')
    .notEmpty()
    .withMessage('Goal type is required')
    .toUpperCase()
    .isIn(ALLOWED_GOAL_TYPES)
    .withMessage(`Goal type must be one of: ${ALLOWED_GOAL_TYPES.join(', ')}`),
  body('baselineValue')
    .notEmpty()
    .withMessage('Baseline value is required')
    .isFloat({ min: 0 })
    .withMessage('Baseline value must be greater than or equal to 0'),
  body('targetValue')
    .notEmpty()
    .withMessage('Target value is required')
    .isFloat({ gt: 0 })
    .withMessage('Target value must be greater than 0'),
  body('currentValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current value cannot be negative'),
  body('unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('startDate must be a valid ISO8601 Date'),
  body('targetDate')
    .notEmpty()
    .withMessage('Target date is required')
    .isISO8601()
    .withMessage('targetDate must be a valid ISO8601 Date'),
  body('priority')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_GOAL_PRIORITIES)
    .withMessage(`Priority must be one of: ${ALLOWED_GOAL_PRIORITIES.join(', ')}`),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_GOAL_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_GOAL_STATUSES.join(', ')}`),
  body('autoTrack')
    .optional()
    .isBoolean()
    .withMessage('autoTrack must be a boolean'),
  body('createdBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid creator User ID format'),
];

export const updateGoalValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid goal ID format'),
  body('goalCode')
    .optional()
    .trim()
    .toUpperCase(),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('department')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Department must be a valid Mongo ID'),
  body('goalType')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_GOAL_TYPES)
    .withMessage(`Goal type must be one of: ${ALLOWED_GOAL_TYPES.join(', ')}`),
  body('baselineValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Baseline value must be greater than or equal to 0'),
  body('targetValue')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Target value must be greater than 0'),
  body('currentValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current value cannot be negative'),
  body('unit')
    .optional()
    .trim(),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO8601 Date'),
  body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('targetDate must be a valid ISO8601 Date'),
  body('priority')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_GOAL_PRIORITIES)
    .withMessage(`Priority must be one of: ${ALLOWED_GOAL_PRIORITIES.join(', ')}`),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_GOAL_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_GOAL_STATUSES.join(', ')}`),
  body('autoTrack')
    .optional()
    .isBoolean()
    .withMessage('autoTrack must be a boolean'),
  body('updatedBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid updater User ID format'),
];

export const getGoalByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid goal ID format'),
];

export const queryGoalsValidation = [
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
  query('goalType')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_GOAL_TYPES)
    .withMessage(`Goal type filter must be one of: ${ALLOWED_GOAL_TYPES.join(', ')}`),
  query('priority')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_GOAL_PRIORITIES)
    .withMessage(`Priority filter must be one of: ${ALLOWED_GOAL_PRIORITIES.join(', ')}`),
  query('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_GOAL_STATUSES)
    .withMessage(`Status filter must be one of: ${ALLOWED_GOAL_STATUSES.join(', ')}`),
  query('achievementStatus')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_ACHIEVEMENT_STATUSES)
    .withMessage(`Achievement status filter must be one of: ${ALLOWED_ACHIEVEMENT_STATUSES.join(', ')}`),
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
    .isIn(['targetDate', 'progressPercentage', 'priority', 'createdAt'])
    .withMessage('Sort by field must be targetDate, progressPercentage, priority, or createdAt'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

export const queryGoalStatsValidation = [
  query('department')
    .optional()
    .isMongoId()
    .withMessage('Department filter must be a valid Mongo ID'),
  query('goalType')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_GOAL_TYPES)
    .withMessage(`Goal type filter must be one of: ${ALLOWED_GOAL_TYPES.join(', ')}`),
  query('priority')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_GOAL_PRIORITIES)
    .withMessage(`Priority filter must be one of: ${ALLOWED_GOAL_PRIORITIES.join(', ')}`),
  query('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_GOAL_STATUSES)
    .withMessage(`Status filter must be one of: ${ALLOWED_GOAL_STATUSES.join(', ')}`),
];

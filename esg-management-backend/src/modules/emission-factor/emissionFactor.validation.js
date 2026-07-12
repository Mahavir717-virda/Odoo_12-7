import { body, param, query } from 'express-validator';
import {
  ALLOWED_SOURCE_TYPES,
  ALLOWED_UNIT_TYPES,
  ALLOWED_CO2_UNITS,
  ALLOWED_EMISSION_STATUSES,
} from './emissionFactor.constants.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

// Whitelisted body payload fields
const ALLOWED_FIELDS = [
  'name',
  'code',
  'description',
  'category',
  'sourceType',
  'unit',
  'emissionValue',
  'co2Unit',
  'effectiveFrom',
  'effectiveTo',
  'country',
  'region',
  'isDefault',
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

export const createEmissionFactorValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .toUpperCase(),
  body('description')
    .optional()
    .trim(),
  body('category')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Category must be a valid Mongo ID'),
  body('sourceType')
    .notEmpty()
    .withMessage('Source type is required')
    .toUpperCase()
    .isIn(ALLOWED_SOURCE_TYPES)
    .withMessage(`Source type must be one of: ${ALLOWED_SOURCE_TYPES.join(', ')}`),
  body('unit')
    .notEmpty()
    .withMessage('Unit type is required')
    .toUpperCase()
    .isIn(ALLOWED_UNIT_TYPES)
    .withMessage(`Unit must be one of: ${ALLOWED_UNIT_TYPES.join(', ')}`),
  body('emissionValue')
    .notEmpty()
    .withMessage('Emission value is required')
    .isFloat({ gt: 0 })
    .withMessage('Emission value must be a positive float greater than 0'),
  body('co2Unit')
    .notEmpty()
    .withMessage('CO2 unit is required')
    .isIn(ALLOWED_CO2_UNITS)
    .withMessage(`CO2 unit must be one of: ${ALLOWED_CO2_UNITS.join(', ')}`),
  body('effectiveFrom')
    .notEmpty()
    .withMessage('Effective from date is required')
    .isISO8601()
    .withMessage('effectiveFrom must be a valid ISO8601 Date'),
  body('effectiveTo')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('effectiveTo must be a valid ISO8601 Date'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country code is required')
    .toUpperCase(),
  body('region')
    .trim()
    .notEmpty()
    .withMessage('Region is required')
    .toUpperCase(),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_EMISSION_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_EMISSION_STATUSES.join(', ')}`),
  body('createdBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid creator User ID format'),
];

export const updateEmissionFactorValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid emission factor ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('code')
    .optional()
    .trim()
    .toUpperCase(),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid Mongo ID'),
  body('sourceType')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_SOURCE_TYPES)
    .withMessage(`Source type must be one of: ${ALLOWED_SOURCE_TYPES.join(', ')}`),
  body('unit')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_UNIT_TYPES)
    .withMessage(`Unit must be one of: ${ALLOWED_UNIT_TYPES.join(', ')}`),
  body('emissionValue')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Emission value must be a positive float greater than 0'),
  body('co2Unit')
    .optional()
    .isIn(ALLOWED_CO2_UNITS)
    .withMessage(`CO2 unit must be one of: ${ALLOWED_CO2_UNITS.join(', ')}`),
  body('effectiveFrom')
    .optional()
    .isISO8601()
    .withMessage('effectiveFrom must be a valid ISO8601 Date'),
  body('effectiveTo')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('effectiveTo must be a valid ISO8601 Date'),
  body('country')
    .optional()
    .trim()
    .toUpperCase(),
  body('region')
    .optional()
    .trim()
    .toUpperCase(),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_EMISSION_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_EMISSION_STATUSES.join(', ')}`),
  body('updatedBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid updater User ID format'),
];

export const getEmissionFactorByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid emission factor ID format'),
];

export const queryEmissionFactorsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Category filter must be a valid Mongo ID'),
  query('sourceType')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_SOURCE_TYPES)
    .withMessage(`Source type must be one of: ${ALLOWED_SOURCE_TYPES.join(', ')}`),
  query('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_EMISSION_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_EMISSION_STATUSES.join(', ')}`),
  query('country')
    .optional()
    .trim()
    .toUpperCase(),
  query('region')
    .optional()
    .trim()
    .toUpperCase(),
  query('unit')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_UNIT_TYPES)
    .withMessage(`Unit must be one of: ${ALLOWED_UNIT_TYPES.join(', ')}`),
  query('effectiveDate')
    .optional()
    .isISO8601()
    .withMessage('effectiveDate must be a valid ISO8601 Date'),
  query('sortBy')
    .optional()
    .isIn(['name', 'emissionValue', 'createdAt', 'effectiveFrom'])
    .withMessage('Sort by field must be name, emissionValue, createdAt, or effectiveFrom'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

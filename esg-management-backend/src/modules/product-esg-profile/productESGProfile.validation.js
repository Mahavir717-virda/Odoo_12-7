import { body, param, query } from 'express-validator';
import {
  ALLOWED_PROFILE_STATUSES,
  ALLOWED_MATERIAL_TYPES,
  ALLOWED_PRODUCT_TYPES,
  ALLOWED_LIFECYCLE_STAGES,
  ALLOWED_WEIGHT_UNITS,
} from './productESGProfile.constants.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

// Whitelisted body payload fields
const ALLOWED_FIELDS = [
  'productCode',
  'productName',
  'description',
  'department',
  'category',
  'emissionFactor',
  'materialType',
  'productType',
  'lifecycleStage',
  'recyclabilityPercentage',
  'recycledContentPercentage',
  'hazardousMaterial',
  'renewableMaterial',
  'packagingWeight',
  'productWeight',
  'weightUnit',
  'countryOfOrigin',
  'manufacturer',
  'supplier',
  'estimatedLifeYears',
  'isCarbonNeutral',
  'carbonNeutralCertificate',
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

export const createProfileValidation = [
  body('productCode')
    .trim()
    .notEmpty()
    .withMessage('Product code is required')
    .toUpperCase(),
  body('productName')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Product name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('department')
    .notEmpty()
    .withMessage('Department ID is required')
    .isMongoId()
    .withMessage('Department must be a valid Mongo ID'),
  body('category')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Category must be a valid Mongo ID'),
  body('emissionFactor')
    .notEmpty()
    .withMessage('Emission factor ID is required')
    .isMongoId()
    .withMessage('Emission factor must be a valid Mongo ID'),
  body('materialType')
    .notEmpty()
    .withMessage('Material type is required')
    .toUpperCase()
    .isIn(ALLOWED_MATERIAL_TYPES)
    .withMessage(`Material type must be one of: ${ALLOWED_MATERIAL_TYPES.join(', ')}`),
  body('productType')
    .notEmpty()
    .withMessage('Product type is required')
    .toUpperCase()
    .isIn(ALLOWED_PRODUCT_TYPES)
    .withMessage(`Product type must be one of: ${ALLOWED_PRODUCT_TYPES.join(', ')}`),
  body('lifecycleStage')
    .notEmpty()
    .withMessage('Lifecycle stage is required')
    .toUpperCase()
    .isIn(ALLOWED_LIFECYCLE_STAGES)
    .withMessage(`Lifecycle stage must be one of: ${ALLOWED_LIFECYCLE_STAGES.join(', ')}`),
  body('recyclabilityPercentage')
    .notEmpty()
    .withMessage('Recyclability percentage is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Recyclability percentage must be a number between 0 and 100'),
  body('recycledContentPercentage')
    .notEmpty()
    .withMessage('Recycled content percentage is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Recycled content percentage must be a number between 0 and 100'),
  body('hazardousMaterial')
    .optional()
    .isBoolean()
    .withMessage('hazardousMaterial must be a boolean'),
  body('renewableMaterial')
    .optional()
    .isBoolean()
    .withMessage('renewableMaterial must be a boolean'),
  body('packagingWeight')
    .notEmpty()
    .withMessage('Packaging weight is required')
    .isFloat({ min: 0 })
    .withMessage('Packaging weight must be a positive number'),
  body('productWeight')
    .notEmpty()
    .withMessage('Product weight is required')
    .isFloat({ gt: 0 })
    .withMessage('Product weight must be a number greater than 0'),
  body('weightUnit')
    .notEmpty()
    .withMessage('Weight unit is required')
    .toUpperCase()
    .isIn(ALLOWED_WEIGHT_UNITS)
    .withMessage(`Weight unit must be one of: ${ALLOWED_WEIGHT_UNITS.join(', ')}`),
  body('countryOfOrigin')
    .trim()
    .notEmpty()
    .withMessage('Country of origin is required')
    .toUpperCase(),
  body('manufacturer')
    .trim()
    .notEmpty()
    .withMessage('Manufacturer is required'),
  body('supplier')
    .trim()
    .notEmpty()
    .withMessage('Supplier is required'),
  body('estimatedLifeYears')
    .notEmpty()
    .withMessage('Estimated life years is required')
    .isFloat({ min: 0 })
    .withMessage('Estimated life years must be a positive number'),
  body('isCarbonNeutral')
    .optional()
    .isBoolean()
    .withMessage('isCarbonNeutral must be a boolean'),
  body('carbonNeutralCertificate')
    .optional({ nullable: true })
    .trim(),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_PROFILE_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_PROFILE_STATUSES.join(', ')}`),
  body('createdBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid creator User ID format'),
];

export const updateProfileValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid profile ID format'),
  body('productCode')
    .optional()
    .trim()
    .toUpperCase(),
  body('productName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Product name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Department must be a valid Mongo ID'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid Mongo ID'),
  body('emissionFactor')
    .optional()
    .isMongoId()
    .withMessage('Emission factor must be a valid Mongo ID'),
  body('materialType')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_MATERIAL_TYPES)
    .withMessage(`Material type must be one of: ${ALLOWED_MATERIAL_TYPES.join(', ')}`),
  body('productType')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_PRODUCT_TYPES)
    .withMessage(`Product type must be one of: ${ALLOWED_PRODUCT_TYPES.join(', ')}`),
  body('lifecycleStage')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_LIFECYCLE_STAGES)
    .withMessage(`Lifecycle stage must be one of: ${ALLOWED_LIFECYCLE_STAGES.join(', ')}`),
  body('recyclabilityPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Recyclability percentage must be a number between 0 and 100'),
  body('recycledContentPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Recycled content percentage must be a number between 0 and 100'),
  body('hazardousMaterial')
    .optional()
    .isBoolean()
    .withMessage('hazardousMaterial must be a boolean'),
  body('renewableMaterial')
    .optional()
    .isBoolean()
    .withMessage('renewableMaterial must be a boolean'),
  body('packagingWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Packaging weight must be a positive number'),
  body('productWeight')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Product weight must be a number greater than 0'),
  body('weightUnit')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_WEIGHT_UNITS)
    .withMessage(`Weight unit must be one of: ${ALLOWED_WEIGHT_UNITS.join(', ')}`),
  body('countryOfOrigin')
    .optional()
    .trim()
    .toUpperCase(),
  body('manufacturer')
    .optional()
    .trim(),
  body('supplier')
    .optional()
    .trim(),
  body('estimatedLifeYears')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated life years must be a positive number'),
  body('isCarbonNeutral')
    .optional()
    .isBoolean()
    .withMessage('isCarbonNeutral must be a boolean'),
  body('carbonNeutralCertificate')
    .optional({ nullable: true })
    .trim(),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_PROFILE_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_PROFILE_STATUSES.join(', ')}`),
  body('updatedBy')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid updater User ID format'),
];

export const getProfileByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid profile ID format'),
];

export const queryProfilesValidation = [
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
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Category filter must be a valid Mongo ID'),
  query('materialType')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_MATERIAL_TYPES)
    .withMessage(`Material type filter must be one of: ${ALLOWED_MATERIAL_TYPES.join(', ')}`),
  query('productType')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_PRODUCT_TYPES)
    .withMessage(`Product type filter must be one of: ${ALLOWED_PRODUCT_TYPES.join(', ')}`),
  query('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_PROFILE_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_PROFILE_STATUSES.join(', ')}`),
  query('countryOfOrigin')
    .optional()
    .trim()
    .toUpperCase(),
  query('manufacturer')
    .optional()
    .trim(),
  query('supplier')
    .optional()
    .trim(),
  query('carbonNeutral')
    .optional()
    .isBoolean()
    .withMessage('carbonNeutral must be a boolean value (true/false)'),
  query('sortBy')
    .optional()
    .isIn(['productName', 'createdAt', 'productWeight', 'estimatedLifeYears'])
    .withMessage('Sort by field must be productName, createdAt, productWeight, or estimatedLifeYears'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

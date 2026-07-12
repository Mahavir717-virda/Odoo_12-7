import { body, param, query } from 'express-validator';
import { ALLOWED_CHALLENGE_STATUSES, ALLOWED_DIFFICULTIES, ALLOWED_VERIFICATION_STATUSES } from './challenge.constants.js';

export const createChallengeValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('category')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('difficulty')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_DIFFICULTIES)
    .withMessage(`Difficulty must be one of: ${ALLOWED_DIFFICULTIES.join(', ')}`),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 date'),
  body('xpReward')
    .isInt({ min: 0 })
    .withMessage('XP reward must be a positive integer'),
  body('pointsReward')
    .isInt({ min: 0 })
    .withMessage('Points reward must be a positive integer'),
  body('badgeId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid badge ID'),
  body('evidenceRequired')
    .optional()
    .isBoolean()
    .withMessage('evidenceRequired must be a boolean'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('maxParticipants must be at least 1'),
];

export const updateChallengeValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid challenge ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('xpReward')
    .optional()
    .isInt({ min: 0 })
    .withMessage('XP reward must be a positive integer'),
  body('pointsReward')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Points reward must be a positive integer'),
  body('status')
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_CHALLENGE_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_CHALLENGE_STATUSES.join(', ')}`),
];

export const getChallengeByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid challenge ID'),
];

export const joinChallengeValidation = [
  body('challengeId')
    .isMongoId()
    .withMessage('Invalid challenge ID'),
  body('employeeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid employee ID'),
];

export const submitEvidenceValidation = [
  body('challengeId')
    .isMongoId()
    .withMessage('Invalid challenge ID'),
  body('fileType')
    .isIn(['image', 'pdf', 'video', 'document'])
    .withMessage('Invalid file type'),
  body('description')
    .optional()
    .trim(),
  body('employeeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid employee ID'),
];

export const verifyEvidenceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid evidence ID'),
  body('status')
    .toUpperCase()
    .isIn(ALLOWED_VERIFICATION_STATUSES)
    .withMessage('Status must be APPROVED or REJECTED'),
  body('remarks')
    .optional()
    .trim(),
  body('adminId')
    .optional()
    .isMongoId()
    .withMessage('Invalid admin ID'),
];

export const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required'),
];

export const createBadgeValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('icon')
    .trim()
    .notEmpty()
    .withMessage('Icon is required'),
];

export const createRewardValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('requiredPoints')
    .isInt({ min: 0 })
    .withMessage('Required points must be a positive integer'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a positive integer'),
];

export const redeemRewardValidation = [
  body('rewardId')
    .isMongoId()
    .withMessage('Invalid reward ID'),
  body('employeeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid employee ID'),
];

export const queryChallengesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }),
];

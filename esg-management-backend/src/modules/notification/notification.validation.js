import { body, param, query } from 'express-validator';

export const getNotificationByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid notification ID format'),
];

export const updatePreferencesValidation = [
  body('challenge')
    .optional()
    .isBoolean(),
  body('badge')
    .optional()
    .isBoolean(),
  body('reward')
    .optional()
    .isBoolean(),
  body('policy')
    .optional()
    .isBoolean(),
  body('audit')
    .optional()
    .isBoolean(),
  body('compliance')
    .optional()
    .isBoolean(),
  body('email')
    .optional()
    .isBoolean(),
  body('inApp')
    .optional()
    .isBoolean(),
];

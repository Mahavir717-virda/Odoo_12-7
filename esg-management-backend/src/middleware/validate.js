import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * Express middleware to validate request payloads (body, query, params) using Joi schemas.
 * @param {object} schema - Joi validation schema containing keys: body, query, params
 */
export const validate = (schema) => (req, res, next) => {
  const validSchema = {};
  
  // Pick keys to validate from request
  ['params', 'query', 'body'].forEach((key) => {
    if (schema[key]) {
      validSchema[key] = schema[key];
    }
  });

  const object = {};
  Object.keys(validSchema).forEach((key) => {
    if (req[key]) {
      object[key] = req[key];
    }
  });

  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, errorMessage));
  }

  Object.assign(req, value);
  return next();
};

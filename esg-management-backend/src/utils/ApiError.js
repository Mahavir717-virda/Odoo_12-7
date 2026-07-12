/**
 * Custom operational API Error class extending standard JS Error.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error description
   * @param {boolean} isOperational - Signifies if error is operational or programming/system error
   * @param {string} stack - Optional stack trace override
   */
  constructor(statusCode, message, isOperational = true, stack = '', errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

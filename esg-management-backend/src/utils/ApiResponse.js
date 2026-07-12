/**
 * Standardized API Response class format.
 */
export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {any} data - Payload data object/array
   * @param {string} message - Feedback message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

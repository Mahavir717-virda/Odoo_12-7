/**
 * Wrapper to eliminate boiler-plate try-catch block setups on controllers.
 * Passes rejected promises to express next() handler.
 * @param {Function} fn - express route handler function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

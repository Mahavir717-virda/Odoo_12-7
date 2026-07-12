/**
 * Core Carbon Calculation Utilities
 */

/**
 * Calculate carbon emission based on quantity and emission factor value.
 * CalculatedEmission = Quantity * EmissionFactorValue (Rounded to 4 decimal places)
 * 
 * @param {number} quantity - Must be greater than 0
 * @param {number} emissionFactorValue - Must be greater than 0
 * @returns {number} calculated emission rounded to 4 decimal places
 */
export const calculateEmission = (quantity, emissionFactorValue) => {
  if (!quantity || quantity <= 0) return 0;
  if (!emissionFactorValue || emissionFactorValue <= 0) return 0;
  
  const rawEmission = quantity * emissionFactorValue;
  return Math.round((rawEmission + Number.EPSILON) * 10000) / 10000;
};

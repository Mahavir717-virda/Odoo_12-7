import { ACHIEVEMENT_STATUS } from './goal.constants.js';

/**
 * Reusable Goal Progress Calculation Helpers
 */

/**
 * Calculate progress percentage: (currentValue / targetValue) * 100.
 * Capped at 100%. Rounded to 2 decimal places.
 * 
 * @param {number} currentValue 
 * @param {number} targetValue 
 * @returns {number} progress percentage
 */
export const calculateProgress = (currentValue, targetValue) => {
  if (!targetValue || targetValue <= 0) return 0;
  if (!currentValue || currentValue <= 0) return 0;
  
  const rawPercentage = (currentValue / targetValue) * 100;
  const progress = Math.min(rawPercentage, 100);
  return Math.round((progress + Number.EPSILON) * 100) / 100;
};

/**
 * Calculate remaining target difference
 * @param {number} currentValue 
 * @param {number} targetValue 
 * @returns {number}
 */
export const calculateRemainingTarget = (currentValue, targetValue) => {
  const diff = targetValue - (currentValue || 0);
  return Math.max(0, Math.round((diff + Number.EPSILON) * 10000) / 10000);
};

/**
 * Calculate days left until targetDate
 * @param {Date|string} targetDate 
 * @returns {number} days remaining
 */
export const calculateDaysRemaining = (targetDate) => {
  if (!targetDate) return 0;
  const target = new Date(targetDate);
  const now = new Date();
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Determine achievement status based on progress, dates, and baseline
 * @param {object} goalData 
 * @returns {string} achievement status enum
 */
export const calculateAchievementStatus = (currentValue, targetValue, targetDate, status) => {
  const progress = calculateProgress(currentValue, targetValue);
  const daysLeft = calculateDaysRemaining(targetDate);
  const now = new Date();
  const target = new Date(targetDate);

  if (progress >= 100) {
    return ACHIEVEMENT_STATUS.ACHIEVED;
  }

  // If the deadline has already passed and progress is under 100
  if (now > target) {
    return ACHIEVEMENT_STATUS.MISSED;
  }

  // If progress is less than 50% and less than 30 days are remaining
  if (progress < 50 && daysLeft < 30) {
    return ACHIEVEMENT_STATUS.AT_RISK;
  }

  return ACHIEVEMENT_STATUS.ON_TRACK;
};

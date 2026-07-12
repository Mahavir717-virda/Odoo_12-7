/**
 * Notification Module Constants
 */

export const NOTIFICATION_TYPE = {
  INFO: 'Info',
  CHALLENGE: 'Challenge',
  BADGE: 'Badge',
  REWARD: 'Reward',
  POLICY: 'Policy',
  AUDIT: 'Audit',
  COMPLIANCE: 'Compliance',
};

export const ALLOWED_NOTIFICATION_TYPES = Object.values(NOTIFICATION_TYPE);

export const NOTIFICATION_PRIORITY = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
};

export const ALLOWED_NOTIFICATION_PRIORITIES = Object.values(NOTIFICATION_PRIORITY);

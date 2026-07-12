/**
 * Policy Module Constants
 */

export const POLICY_STATUS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export const ALLOWED_POLICY_STATUSES = Object.values(POLICY_STATUS);

export const POLICY_CATEGORIES = {
  ENVIRONMENTAL: 'Environmental',
  SOCIAL: 'Social',
  GOVERNANCE: 'Governance',
  HEALTH: 'Health',
  CSR: 'CSR',
};

export const ALLOWED_POLICY_CATEGORIES = Object.values(POLICY_CATEGORIES);

/**
 * Audit Module Constants
 */

export const AUDIT_STATUS = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CLOSED: 'Closed',
};

export const ALLOWED_AUDIT_STATUSES = Object.values(AUDIT_STATUS);

export const FINDING_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const ALLOWED_FINDING_STATUSES = Object.values(FINDING_STATUS);

export const CORRECTIVE_ACTION_STATUS = {
  PENDING: 'Pending',
  RESOLVED: 'Resolved',
  VERIFIED: 'Verified',
};

export const ALLOWED_CORRECTIVE_ACTION_STATUSES = Object.values(CORRECTIVE_ACTION_STATUS);

export const AUDIT_SEVERITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const ALLOWED_SEVERITIES = Object.values(AUDIT_SEVERITY);

export const AUDIT_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const ALLOWED_PRIORITIES = Object.values(AUDIT_PRIORITY);

/**
 * Compliance Module Constants
 */

export const COMPLIANCE_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const ALLOWED_COMPLIANCE_STATUSES = Object.values(COMPLIANCE_STATUS);

export const COMPLIANCE_SOURCE = {
  AUDIT: 'Audit',
  POLICY: 'Policy',
  MANUAL: 'Manual',
};

export const ALLOWED_COMPLIANCE_SOURCES = Object.values(COMPLIANCE_SOURCE);

export const COMPLIANCE_SEVERITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const ALLOWED_SEVERITIES = Object.values(COMPLIANCE_SEVERITY);

export const COMPLIANCE_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const ALLOWED_PRIORITIES = Object.values(COMPLIANCE_PRIORITY);

export const reportPermissions = {
  Admin: {
    allowedReports: ['Environmental Report', 'Social Report', 'Governance Report', 'ESG Summary'],
    customBuilderModules: ['Environmental', 'Social', 'Governance', 'Gamification', 'Settings', 'Audit', 'Challenges', 'CSR', 'Rewards'],
    canSchedule: true,
    canDeleteTemplates: true,
    unrestrictedBuilder: true,
  },
  'Sustainability Team': {
    allowedReports: ['Environmental Report', 'ESG Summary'],
    customBuilderModules: ['Environmental'],
    canSchedule: false,
    canDeleteTemplates: false,
    unrestrictedBuilder: false,
  },
  'Compliance Team': {
    allowedReports: ['Governance Report', 'ESG Summary'],
    customBuilderModules: ['Governance'],
    canSchedule: false,
    canDeleteTemplates: false,
    unrestrictedBuilder: false,
  },
  HR: {
    allowedReports: ['Social Report', 'ESG Summary'],
    customBuilderModules: ['Social'],
    canSchedule: false,
    canDeleteTemplates: false,
    unrestrictedBuilder: false,
  },
  Manager: {
    allowedReports: ['Environmental Report', 'Social Report', 'Governance Report', 'ESG Summary'],
    customBuilderModules: ['Environmental', 'Social', 'Governance', 'Gamification'],
    canSchedule: false,
    canDeleteTemplates: false,
    unrestrictedBuilder: false,
    lockDepartment: true,
  },
  Employee: {
    allowedReports: [],
    customBuilderModules: [],
    canSchedule: false,
    canDeleteTemplates: false,
    unrestrictedBuilder: false,
  }
};

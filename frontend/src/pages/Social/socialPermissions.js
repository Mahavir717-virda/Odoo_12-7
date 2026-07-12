/**
 * Social Module Role-Based Access Control (RBAC) Permissions
 */
export const socialPermissions = {
  Admin: {
    canCreateActivity: true,
    canApproveAnyParticipation: true,
    canApproveDeptParticipation: true,
    canViewDiversity: true,
    canManageTraining: true,
    canConfigSocialSettings: true,
  },
  HR: {
    canCreateActivity: true,
    canApproveAnyParticipation: true,
    canApproveDeptParticipation: true,
    canViewDiversity: true,
    canManageTraining: true,
    canConfigSocialSettings: false, // view only
  },
  Manager: {
    canCreateActivity: false,
    canApproveAnyParticipation: false,
    canApproveDeptParticipation: true, // scoped to same department
    canViewDiversity: false,
    canManageTraining: false, // view only
    canConfigSocialSettings: false,
  },
  Employee: {
    canCreateActivity: false,
    canApproveAnyParticipation: false,
    canApproveDeptParticipation: false,
    canViewDiversity: false,
    canManageTraining: false,
    canConfigSocialSettings: false,
  },
  'Sustainability Team': {
    canCreateActivity: false,
    canApproveAnyParticipation: false,
    canApproveDeptParticipation: false,
    canViewDiversity: false,
    canManageTraining: false,
    canConfigSocialSettings: false,
  },
  'Compliance Team': {
    canCreateActivity: false,
    canApproveAnyParticipation: false,
    canApproveDeptParticipation: false,
    canViewDiversity: false,
    canManageTraining: false,
    canConfigSocialSettings: false,
  }
};

export const canCreateActivity = (role) => {
  return socialPermissions[role]?.canCreateActivity || false;
};

export const canApproveParticipation = (role, activityDept, userDept) => {
  const perm = socialPermissions[role];
  if (!perm) return false;
  if (perm.canApproveAnyParticipation) return true;
  if (perm.canApproveDeptParticipation && activityDept && userDept && activityDept.toLowerCase() === userDept.toLowerCase()) {
    return true;
  }
  return false;
};

export const canViewDiversity = (role) => {
  return socialPermissions[role]?.canViewDiversity || false;
};

export const canManageTraining = (role) => {
  return socialPermissions[role]?.canManageTraining || false;
};

export const canConfigSocialSettings = (role) => {
  return socialPermissions[role]?.canConfigSocialSettings || false;
};

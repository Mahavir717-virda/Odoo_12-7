import { 
  calculateCO2, 
  calculateGoalProgress, 
  getGoalStatus, 
  checkBadgeUnlocks,
  calculateDepartmentScores,
  calculateTotalScore,
  calculateOverallOrgScore,
  isIssueOverdue
} from './calculations';

// INITIAL SEED DATA
const defaultDepartments = [
  { name: "Manufacturing", code: "MFG", head: "S. Nair", parent: "—", status: "Active" },
  { name: "Logistics", code: "LOG", head: "R. Iyer", parent: "Manufacturing", status: "Active" },
  { name: "Corporate", code: "COR", head: "A. Mehta", parent: "—", status: "Active" },
  { name: "R&D", code: "RND", head: "P. Sen", parent: "—", status: "Active" }
];

const defaultUsers = [
  { id: 'u1', name: "Aditi Rao", role: "Employee", department: "Manufacturing", points: 3910, xp: 3910, completedCount: 3, badges: [1, 2] },
  { id: 'u2', name: "Karan Shah", role: "Employee", department: "Manufacturing", points: 1500, xp: 1500, completedCount: 1, badges: [1] },
  { id: 'u3', name: "S. Nair", role: "Manager", department: "Manufacturing", points: 250, xp: 250, completedCount: 0, badges: [] },
  { id: 'u4', name: "Sarah HR", role: "HR", department: "Corporate", points: 100, xp: 100, completedCount: 0, badges: [] },
  { id: 'u5', name: "Susan Sustainability", role: "Sustainability Team", department: "R&D", points: 100, xp: 100, completedCount: 0, badges: [] },
  { id: 'u6', name: "Charlie Compliance", role: "Compliance Team", department: "Corporate", points: 120, xp: 120, completedCount: 0, badges: [] }
];

const defaultGoals = [
  { id: 1, name: "Reduce Fleet Emissions", department: "Logistics", targetCO2: 500, currentCO2: 390, progress: 78, deadline: "2026-12-31", status: "Active" },
  { id: 2, name: "Cut Packaging Waste", department: "Manufacturing", targetCO2: 120, currentCO2: 98, progress: 82, deadline: "2026-09-30", status: "On Track" },
  { id: 3, name: "Office Energy Cut", department: "Corporate", targetCO2: 80, currentCO2: 80, progress: 100, deadline: "2026-06-30", status: "Completed" }
];

const defaultFactors = [
  { id: 1, name: "Electricity Grid (US)", category: "Scope 2", factorValue: 0.38, unit: "kg/kWh", source: "EPA 2024" },
  { id: 2, name: "Natural Gas Combustion", category: "Scope 1", factorValue: 2.03, unit: "kg/m³", source: "GHG Protocol" },
  { id: 3, name: "Diesel Truck Logistics", category: "Scope 1", factorValue: 2.68, unit: "kg/L", source: "DEFRA 2023" }
];

const defaultProfiles = [
  { id: 1, name: "EcoSmart Hub 2.0", carbonFootprint: "12.4 kg CO2e", recyclability: "92%", certification: "Energy Star" },
  { id: 2, name: "EcoPack Box XL", carbonFootprint: "0.85 kg CO2e", recyclability: "100%", certification: "FSC Certified" }
];

const defaultTransactions = [
  { id: 1, date: "2026-07-10", desc: "Offset Purchase - Gold Standard", type: "Credit", quantity: 100, factorValue: 1, amountCO2: -100, cost: "$1,200", department: "Logistics" },
  { id: 2, date: "2026-07-08", desc: "Q2 Logistics Fleet Fuel Usage", type: "Emission", quantity: 168, factorValue: 2.68, amountCO2: 450, cost: "$5,400 equivalents", department: "Logistics" },
  { id: 3, date: "2026-07-01", desc: "Solar Array Power Generation", type: "Offset", quantity: 118, factorValue: 0.38, amountCO2: -45, cost: "$0", department: "Manufacturing" }
];

const defaultActivities = [
  { id: 1, title: "Mangrove Planting Drive", pointsValue: 120, department: "Corporate", status: "Active", date: "2026-07-15", participantsCount: 14 },
  { id: 2, title: "E-Waste Disposal Week", pointsValue: 80, department: "Manufacturing", status: "Active", date: "2026-07-22", participantsCount: 8 }
];

const defaultParticipations = [
  { id: 1, name: "Aditi Rao", department: "Manufacturing", activity: "Mangrove Planting Drive", pointsEarned: 120, dateJoined: "2026-07-08", status: "Approved" },
  { id: 2, name: "Karan Shah", department: "Manufacturing", activity: "E-Waste Disposal Week", pointsEarned: 80, dateJoined: "2026-07-09", status: "Pending" }
];

const defaultBadges = [
  { id: 1, name: "Green Beginner", desc: "First ESG activity complete", iconType: "star", unlockRule: "completed>=1" },
  { id: 2, name: "Carbon Saver", desc: "Reduced 100kg CO₂", iconType: "medal", unlockRule: "xp>=200" },
  { id: 3, name: "Sustainability Champion", desc: "Completed 5 challenges", iconType: "trophy", unlockRule: "completed>=5" }
];

const defaultRewards = [
  { id: 1, name: "Eco Thermal Flask", costXp: 300, stock: 12, category: "Merchandise" },
  { id: 2, name: "Solar Phone Charger", costXp: 750, stock: 4, category: "Hardware" },
  { id: 3, name: "Tree Planted in Your Name", costXp: 150, stock: 999, category: "Social Good" }
];

const defaultChallenges = [
  { id: 1, title: "Sustainability Sprint", xp: 200, difficulty: "Hard", deadline: "2026-07-20", status: "Active", hasJoined: false },
  { id: 2, title: "Recycle Challenge", xp: 80, difficulty: "Easy", deadline: "2026-07-15", status: "Active", hasJoined: false }
];

const defaultChallengeParticipations = [
  { id: 1, name: "Aditi Rao", department: "Manufacturing", challenge: "Recycle Challenge", xpEarned: 80, dateJoined: "2026-07-08", status: "Approved" },
  { id: 2, name: "Karan Shah", department: "Manufacturing", challenge: "Sustainability Sprint", xpEarned: 200, dateJoined: "2026-07-05", status: "Pending" }
];

const defaultPolicies = [
  { id: 1, name: "Code of Supplier Conduct", desc: "Sets minimum environmental and safety requirements for our vendors.", effectiveDate: "2026-01-15", targetAcks: 200, currentAcks: 142, status: "Active" }
];

const defaultPolicyAcks = [
  { id: 1, employee: "Aditi Rao", department: "Manufacturing", policy: "Code of Supplier Conduct", ackDate: "2026-02-10" }
];

const defaultAudits = [
  { id: 1, name: "Vendor Integrity Audit", auditor: "EY Global", date: "2026-06-15", findings: 2, status: "Under Review" }
];

const defaultComplianceIssues = [
  { id: 1, title: "Logistics Fuel Reporting Gap", department: "Logistics", severity: "Medium", dueDate: "2026-07-01", status: "Open", assignee: "R. Iyer" }
];

const defaultWeights = { environmental: 40, social: 30, governance: 30 };
const defaultToggles = { autoEmission: true, requireEvidence: false, autoAwardBadges: true, emailAlerts: true };

// Getters & Setters wrapper
export function getStorageItem(key, defaultValue) {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
}

export function setStorageItem(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// Database initialization
export function initializeDB() {
  if (!localStorage.getItem('db_initialized')) {
    setStorageItem('db_departments', defaultDepartments);
    setStorageItem('db_users', defaultUsers);
    setStorageItem('db_goals', defaultGoals);
    setStorageItem('db_factors', defaultFactors);
    setStorageItem('db_profiles', defaultProfiles);
    setStorageItem('db_transactions', defaultTransactions);
    setStorageItem('db_activities', defaultActivities);
    setStorageItem('db_participations', defaultParticipations);
    setStorageItem('db_badges', defaultBadges);
    setStorageItem('db_rewards', defaultRewards);
    setStorageItem('db_challenges', defaultChallenges);
    setStorageItem('db_challenge_participations', defaultChallengeParticipations);
    setStorageItem('db_policies', defaultPolicies);
    setStorageItem('db_policy_acks', defaultPolicyAcks);
    setStorageItem('db_audits', defaultAudits);
    setStorageItem('db_compliance_issues', defaultComplianceIssues);
    setStorageItem('db_weights', defaultWeights);
    setStorageItem('db_toggles', defaultToggles);
    localStorage.setItem('db_initialized', 'true');
  }
}

// Recalculates all ESG scores dynamically
export function recalculateAllScores() {
  initializeDB();
  const depts = getStorageItem('db_departments', defaultDepartments);
  const goals = getStorageItem('db_goals', defaultGoals);
  const participations = getStorageItem('db_participations', defaultParticipations);
  const policies = getStorageItem('db_policies', defaultPolicies);
  const complianceIssues = getStorageItem('db_compliance_issues', defaultComplianceIssues);
  const weights = getStorageItem('db_weights', defaultWeights);

  const dataPayload = { goals, participations, policies, complianceIssues };

  const deptScores = {};
  depts.forEach(d => {
    const scores = calculateDepartmentScores(d.name, dataPayload);
    const total = calculateTotalScore(scores, weights);
    deptScores[d.name] = { ...scores, total };
  });

  // Calculate Overall Organizational Score
  const totalScoresList = Object.values(deptScores).map(ds => ds.total);
  const overallScore = calculateOverallOrgScore(totalScoresList);

  // Compute average metrics for global overview
  const envAvg = Math.round(Object.values(deptScores).reduce((sum, s) => sum + s.environmentalScore, 0) / depts.length);
  const socAvg = Math.round(Object.values(deptScores).reduce((sum, s) => sum + s.socialScore, 0) / depts.length);
  const govAvg = Math.round(Object.values(deptScores).reduce((sum, s) => sum + s.governanceScore, 0) / depts.length);

  return {
    deptScores,
    overallScore,
    environmentalScore: envAvg,
    socialScore: socAvg,
    governanceScore: govAvg
  };
}

// Side Effect: Trigger badge checks and points addition
export function triggerPointsAndBadgeUnlocks(userName, pointsAmount, xpAmount, showToast, createNotification) {
  const users = getStorageItem('db_users', defaultUsers);
  const badges = getStorageItem('db_badges', defaultBadges);
  const toggles = getStorageItem('db_toggles', defaultToggles);

  const updatedUsers = users.map(u => {
    if (u.name === userName) {
      const newPoints = (u.points || 0) + pointsAmount;
      const newXP = (u.xp || 0) + xpAmount;
      const newCompleted = (u.completedCount || 0) + 1;
      
      const stats = { points: newPoints, xp: newXP, completedCount: newCompleted };
      
      // Auto award check
      if (toggles.autoAwardBadges) {
        const unlockedBadges = checkBadgeUnlocks(stats, badges, u.badges || []);
        if (unlockedBadges.length > 0) {
          unlockedBadges.forEach(badge => {
            u.badges = [...(u.badges || []), badge.id];
            const msg = `🏅 You unlocked ${badge.name}!`;
            if (showToast) showToast(msg, "success");
            if (createNotification) createNotification(u.id, "success", msg);
          });
        }
      }

      return {
        ...u,
        points: newPoints,
        xp: newXP,
        completedCount: newCompleted
      };
    }
    return u;
  });

  setStorageItem('db_users', updatedUsers);
}

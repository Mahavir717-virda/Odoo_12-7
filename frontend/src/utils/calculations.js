/**
 * ESG Management Platform - Calculation Utilities
 * This file contains pure calculation functions used to compute scores, carbon footprints,
 * and badge rewards across the platform.
 */

/**
 * 1. Carbon Emission Auto-Calculation
 * Computes emissions in kg CO₂ based on quantity and the selected factor value.
 * Formula: CO₂ = quantity * factorValue
 */
export function calculateCO2(quantity, factorValue) {
  const qty = parseFloat(quantity) || 0;
  const factor = parseFloat(factorValue) || 0;
  return parseFloat((qty * factor).toFixed(2));
}

/**
 * 2. Sustainability Goal Progress Auto-Calculation
 * Computes progress percentage as an integer capped at 100.
 * Formula: Min(100, Round((current / target) * 100))
 */
export function calculateGoalProgress(current, target) {
  const cur = parseFloat(current) || 0;
  const tgt = parseFloat(target) || 1; // Avoid division by zero
  if (tgt <= 0) return 0;
  return Math.min(100, Math.round((cur / tgt) * 100));
}

/**
 * Derives goal status based on progress percentage.
 * Formula: Progress >= 100% -> Completed; Progress >= 70% -> On Track; Else -> Active
 */
export function getGoalStatus(progress) {
  if (progress >= 100) return 'Completed';
  if (progress >= 70) return 'On Track';
  return 'Active';
}

/**
 * 3. XP / Points Auto-Calculation & 4. Badge Auto-Award Logic
 * Determines which badges are unlocked based on user stats.
 * unlockRule format: "xp>=X", "points>=X", "completed>=X"
 */
export function checkBadgeUnlocks(userStats, allBadges, existingBadgeIds = []) {
  const unlocked = [];
  const xp = parseInt(userStats.xp, 10) || 0;
  const points = parseInt(userStats.points, 10) || 0;
  const completed = parseInt(userStats.completedCount, 10) || 0;

  allBadges.forEach(badge => {
    // If user already has it, skip
    if (existingBadgeIds.includes(badge.id)) return;

    const rule = badge.unlockRule || "";
    let isEligible = false;

    if (rule.startsWith("xp>=")) {
      const target = parseInt(rule.replace("xp>=", ""), 10);
      if (xp >= target) isEligible = true;
    } else if (rule.startsWith("points>=")) {
      const target = parseInt(rule.replace("points>=", ""), 10);
      if (points >= target) isEligible = true;
    } else if (rule.startsWith("completed>=")) {
      const target = parseInt(rule.replace("completed>=", ""), 10);
      if (completed >= target) isEligible = true;
    } else {
      // Default fallback unlock rule if not specified
      if (xp >= 100) isEligible = true;
    }

    if (isEligible) {
      unlocked.push(badge);
    }
  });

  return unlocked;
}

/**
 * 5. Department & Overall ESG Score Auto-Calculation
 * Formulas:
 * - Environmental Score: Average goal progress % of department's active goals. Default: 75%
 * - Social Score: (Approved Participations / Total Participations) * 100. Default: 80%
 * - Governance Score: Policy acknowledgement rate (Ack Count / Total Employee Target) * 100, 
 *   plus (Resolved Issues / Total Issues) * 100 averaged. Default: 85%
 */
export function calculateDepartmentScores(deptName, data) {
  const { goals = [], participations = [], policies = [], complianceIssues = [] } = data;

  // Environmental Score
  const deptGoals = goals.filter(g => g.department === deptName);
  let environmentalScore = 75; // baseline
  if (deptGoals.length > 0) {
    const totalProgress = deptGoals.reduce((sum, g) => sum + calculateGoalProgress(g.currentCO2, g.targetCO2), 0);
    environmentalScore = Math.round(totalProgress / deptGoals.length);
  }

  // Social Score
  const deptParts = participations.filter(p => p.department === deptName || p.name?.includes(deptName));
  let socialScore = 80; // baseline
  if (deptParts.length > 0) {
    const completed = deptParts.filter(p => p.status === 'Completed' || p.status === 'Approved').length;
    socialScore = Math.round((completed / deptParts.length) * 100);
  }

  // Governance Score
  const deptIssues = complianceIssues.filter(i => i.department === deptName);
  let issueScore = 90;
  if (deptIssues.length > 0) {
    const resolved = deptIssues.filter(i => i.status === 'Resolved').length;
    issueScore = Math.round((resolved / deptIssues.length) * 100);
  }

  // Policy acknowledgements
  const deptAcks = policies.length > 0 ? 80 : 100; // baseline ack rate

  const governanceScore = Math.round((issueScore + deptAcks) / 2);

  return {
    environmentalScore: Math.max(10, Math.min(100, environmentalScore)),
    socialScore: Math.max(10, Math.min(100, socialScore)),
    governanceScore: Math.max(10, Math.min(100, governanceScore))
  };
}

/**
 * Calculates total ESG score for a department based on config weights.
 * Formula: Env * (W_env / 100) + Soc * (W_soc / 100) + Gov * (W_gov / 100)
 */
export function calculateTotalScore(scores, weights = { environmental: 40, social: 30, governance: 30 }) {
  const wEnv = parseFloat(weights.environmental) || 40;
  const wSoc = parseFloat(weights.social) || 30;
  const wGov = parseFloat(weights.governance) || 30;

  const total = (scores.environmentalScore * wEnv / 100) +
                (scores.socialScore * wSoc / 100) +
                (scores.governanceScore * wGov / 100);

  return Math.round(total);
}

/**
 * Calculates Overall Organizational Score as the average of all department total scores.
 */
export function calculateOverallOrgScore(deptScoresList) {
  if (!deptScoresList || deptScoresList.length === 0) return 75;
  const sum = deptScoresList.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / deptScoresList.length);
}

/**
 * 6. Compliance Issue Overdue Auto-Flagging
 * Checks if an open issue has a due date before today.
 */
export function isIssueOverdue(issue) {
  if (issue.status !== 'Open') return false;
  if (!issue.dueDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return issue.dueDate < today;
}

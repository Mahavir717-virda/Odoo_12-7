import mongoose from 'mongoose';

export class DashboardService {
  async getSummary() {
    const User = mongoose.model('User');
    const Challenge = mongoose.model('Challenge');
    const ChallengeParticipant = mongoose.models.ChallengeParticipant || mongoose.model('ChallengeParticipant');
    const Compliance = mongoose.models.Compliance || mongoose.model('Compliance');
    const Audit = mongoose.models.Audit || mongoose.model('Audit');
    const Policy = mongoose.models.Policy || mongoose.model('Policy');

    const [
      totalEmployees,
      totalChallenges,
      activeChallenges,
      completedChallenges,
      openCompliance,
      closedCompliance,
      totalAudits,
      publishedPolicies,
    ] = await Promise.all([
      User.countDocuments({}),
      Challenge.countDocuments({}),
      Challenge.countDocuments({ status: 'Active' }),
      ChallengeParticipant.countDocuments({ status: 'COMPLETED' }),
      Compliance.countDocuments({ status: { $ne: 'Closed' } }),
      Compliance.countDocuments({ status: 'Closed' }),
      Audit.countDocuments({}),
      Policy.countDocuments({ status: 'Published' }),
    ]);

    return {
      totalEmployees,
      totalChallenges,
      activeChallenges,
      completedChallenges,
      openCompliance,
      closedCompliance,
      totalAudits,
      publishedPolicies,
    };
  }

  async getComplianceStats() {
    const Compliance = mongoose.models.Compliance || mongoose.model('Compliance');
    const stats = await Compliance.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$severity', 'High'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$severity', 'Medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$severity', 'Low'] }, 1, 0] } },
        }
      }
    ]);
    return stats[0] || { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, high: 0, medium: 0, low: 0 };
  }

  async getChallengeStats() {
    const Challenge = mongoose.model('Challenge');
    const ChallengeParticipant = mongoose.models.ChallengeParticipant || mongoose.model('ChallengeParticipant');

    const totalChallenges = await Challenge.countDocuments({});
    const activeChallenges = await Challenge.countDocuments({ status: 'Active' });
    const completedChallenges = await ChallengeParticipant.countDocuments({ status: 'COMPLETED' });
    const employeesParticipated = await ChallengeParticipant.distinct('employeeId');

    const topChallengeAgg = await ChallengeParticipant.aggregate([
      { $group: { _id: '$challengeId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'challenges', localField: '_id', foreignField: '_id', as: 'challenge' } },
      { $unwind: '$challenge' }
    ]);

    return {
      totalChallenges,
      activeChallenges,
      completedChallenges,
      employeesParticipatedCount: employeesParticipated.length,
      topChallenge: topChallengeAgg[0] ? topChallengeAgg[0].challenge.name : 'N/A',
    };
  }

  async getBadgeStats() {
    const Badge = mongoose.models.Badge || mongoose.model('Badge');
    const EmployeeBadge = mongoose.models.EmployeeBadge || mongoose.model('EmployeeBadge');

    const totalBadges = await Badge.countDocuments({});
    const badgesAwarded = await EmployeeBadge.countDocuments({});
    const uniqueEmployees = await EmployeeBadge.distinct('employeeId');

    const topBadgeAgg = await EmployeeBadge.aggregate([
      { $group: { _id: '$badgeId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'badges', localField: '_id', foreignField: '_id', as: 'badge' } },
      { $unwind: '$badge' }
    ]);

    return {
      totalBadges,
      badgesAwarded,
      topBadge: topBadgeAgg[0] ? topBadgeAgg[0].badge.name : 'N/A',
      employeesWithBadgesCount: uniqueEmployees.length,
    };
  }

  async getRewardStats() {
    const Reward = mongoose.models.Reward || mongoose.model('Reward');
    const RewardRedemption = mongoose.models.RewardRedemption || mongoose.model('RewardRedemption');

    const totalRewards = await Reward.countDocuments({});
    const redeemedCount = await RewardRedemption.countDocuments({ status: 'Approved' });
    const pendingCount = await RewardRedemption.countDocuments({ status: 'Pending' });
    const availableCount = await Reward.countDocuments({ isActive: true, stock: { $gt: 0 } });

    return {
      totalRewards,
      redeemedCount,
      pendingCount,
      availableCount,
    };
  }

  async getPolicyStats() {
    const Policy = mongoose.models.Policy || mongoose.model('Policy');
    const PolicyAcknowledgement = mongoose.models.PolicyAcknowledgement || mongoose.model('PolicyAcknowledgement');

    const publishedCount = await Policy.countDocuments({ status: 'Published' });
    const draftCount = await Policy.countDocuments({ status: 'Draft' });
    const archivedCount = await Policy.countDocuments({ status: 'Archived' });
    const acknowledgedCount = await PolicyAcknowledgement.countDocuments({ acknowledged: true });

    return {
      publishedCount,
      draftCount,
      archivedCount,
      acknowledgedCount,
    };
  }

  async getAuditStats() {
    const Audit = mongoose.models.Audit || mongoose.model('Audit');
    const AuditFinding = mongoose.models.AuditFinding || mongoose.model('AuditFinding');
    const CorrectiveAction = mongoose.models.CorrectiveAction || mongoose.model('CorrectiveAction');

    const scheduledAudits = await Audit.countDocuments({ status: 'Scheduled' });
    const completedAudits = await Audit.countDocuments({ status: 'Completed' });
    const openFindings = await AuditFinding.countDocuments({ status: { $ne: 'Closed' } });
    const resolvedFindings = await AuditFinding.countDocuments({ status: 'Closed' });
    const pendingActions = await CorrectiveAction.countDocuments({ status: 'Pending' });

    return {
      scheduledAudits,
      completedAudits,
      openFindings,
      resolvedFindings,
      pendingActions,
    };
  }

  async getEmployeeStats() {
    const User = mongoose.model('User');
    const topEmployees = await User.find({})
      .sort({ xp: -1 })
      .limit(10)
      .select('name email xp points');

    return {
      topEmployees,
    };
  }

  async getChartData() {
    const ChallengeParticipant = mongoose.models.ChallengeParticipant || mongoose.model('ChallengeParticipant');
    const Compliance = mongoose.models.Compliance || mongoose.model('Compliance');
    const EmployeeBadge = mongoose.models.EmployeeBadge || mongoose.model('EmployeeBadge');

    // Aggregate category groupings
    const challengeCategoryDistribution = await ChallengeParticipant.aggregate([
      { $lookup: { from: 'challenges', localField: 'challengeId', foreignField: '_id', as: 'challenge' } },
      { $unwind: '$challenge' },
      { $group: { _id: '$challenge.category', count: { $sum: 1 } } }
    ]);

    const complianceStatusPie = await Compliance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const badgeDistribution = await EmployeeBadge.aggregate([
      { $lookup: { from: 'badges', localField: 'badgeId', foreignField: '_id', as: 'badge' } },
      { $unwind: '$badge' },
      { $group: { _id: '$badge.name', count: { $sum: 1 } } }
    ]);

    const monthlyParticipation = await ChallengeParticipant.aggregate([
      { $group: { _id: { $month: '$joinedAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    return {
      challengeCategoryDistribution,
      complianceStatusPie,
      badgeDistribution,
      monthlyParticipation,
    };
  }
}

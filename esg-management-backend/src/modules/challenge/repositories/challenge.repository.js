import { Challenge } from '../models/Challenge.js';
import { ChallengeCategory } from '../models/ChallengeCategory.js';
import { ChallengeParticipant } from '../models/ChallengeParticipant.js';
import { ChallengeProgress } from '../models/ChallengeProgress.js';
import { ChallengeEvidence } from '../models/ChallengeEvidence.js';
import { ChallengeVerification } from '../models/ChallengeVerification.js';
import { XPTransaction } from '../models/XPTransaction.js';
import { Badge } from '../models/Badge.js';
import { EmployeeBadge } from '../models/EmployeeBadge.js';
import { Reward } from '../models/Reward.js';
import { RewardRedemption } from '../models/RewardRedemption.js';
import mongoose from 'mongoose';

export class ChallengeRepository {
  // ==========================================
  // CHALLENGE & CATEGORY METHODS
  // ==========================================

  async createChallenge(challengeData) {
    return await Challenge.create(challengeData);
  }

  async findChallengeById(id) {
    return await Challenge.findOne({ _id: id, isDeleted: false })
      .populate('category', 'name icon color')
      .populate('badgeId', 'title icon');
  }

  async findChallengeByTitle(title) {
    return await Challenge.findOne({ title: new RegExp(`^${title.trim()}$`, 'i'), isDeleted: false });
  }

  async findAllChallenges({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search = '', status, category, difficulty }) {
    const query = { isDeleted: false };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const [results, totalCount] = await Promise.all([
      Challenge.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('category', 'name icon color')
        .populate('badgeId', 'title icon'),
      Challenge.countDocuments(query),
    ]);

    return {
      results,
      totalCount,
      limit,
      page,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async updateChallenge(id, updateData) {
    return await Challenge.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async softDeleteChallenge(id) {
    return await Challenge.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );
  }

  async createCategory(categoryData) {
    return await ChallengeCategory.create(categoryData);
  }

  async findCategoryByName(name) {
    return await ChallengeCategory.findOne({ name: new RegExp(`^${name.trim()}$`, 'i'), active: true });
  }

  async findAllCategories() {
    return await ChallengeCategory.find({ active: true });
  }

  // ==========================================
  // PARTICIPANT & PROGRESS METHODS
  // ==========================================

  async joinChallenge(employeeId, challengeId) {
    return await ChallengeParticipant.create({ employeeId, challengeId });
  }

  async getParticipant(employeeId, challengeId) {
    return await ChallengeParticipant.findOne({ employeeId, challengeId, isDeleted: false });
  }

  async getParticipantsCount(challengeId) {
    return await ChallengeParticipant.countDocuments({ challengeId, status: 'JOINED', isDeleted: false });
  }

  async findAllParticipants({ challengeId, status } = {}) {
    const query = { isDeleted: false };
    if (challengeId) query.challengeId = challengeId;
    if (status) query.status = status;
    return await ChallengeParticipant.find(query)
      .populate('employeeId', 'name email department')
      .populate('challengeId', 'title xpReward')
      .sort({ joinedAt: -1 });
  }

  async completeParticipantById(participantId) {
    return await ChallengeParticipant.findOneAndUpdate(
      { _id: participantId, isDeleted: false },
      { $set: { status: 'COMPLETED' } },
      { new: true }
    );
  }

  async updateParticipantStatus(employeeId, challengeId, status) {
    return await ChallengeParticipant.findOneAndUpdate(
      { employeeId, challengeId, isDeleted: false },
      { $set: { status } },
      { new: true }
    );
  }

  async createOrUpdateProgress(employeeId, challengeId, completedTasks, totalTasks) {
    const progress = Math.round((completedTasks / totalTasks) * 100);
    return await ChallengeProgress.findOneAndUpdate(
      { employeeId, challengeId },
      { $set: { completedTasks, totalTasks, progress } },
      { new: true, upsert: true }
    );
  }

  async getProgress(employeeId, challengeId) {
    return await ChallengeProgress.findOne({ employeeId, challengeId, isDeleted: false });
  }

  // ==========================================
  // EVIDENCE & VERIFICATION METHODS
  // ==========================================

  async uploadEvidence(evidenceData) {
    return await ChallengeEvidence.create(evidenceData);
  }

  async findEvidenceById(id) {
    return await ChallengeEvidence.findOne({ _id: id, isDeleted: false });
  }

  async updateEvidenceStatus(id, status) {
    return await ChallengeEvidence.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { status } },
      { new: true }
    );
  }

  async createVerification(verificationData) {
    return await ChallengeVerification.create(verificationData);
  }

  async findAllPendingEvidence() {
    return await ChallengeEvidence.find({ status: 'PENDING', isDeleted: false })
      .populate('challengeId', 'title xpReward pointsReward')
      .populate('employeeId', 'name email');
  }

  // ==========================================
  // XP & USER BALANCE METHODS
  // ==========================================

  async createXPTransaction(txData) {
    return await XPTransaction.create(txData);
  }

  async updateUserBalance(employeeId, xpGained, pointsGained) {
    const User = mongoose.model('User');
    return await User.findByIdAndUpdate(
      employeeId,
      { $inc: { xp: xpGained, points: pointsGained } },
      { new: true }
    );
  }

  // ==========================================
  // BADGE METHODS
  // ==========================================

  async createBadge(badgeData) {
    return await Badge.create(badgeData);
  }

  async findBadgesToUnlock(userXp, userChallengesCount) {
    return await Badge.find({
      isDeleted: false,
      $or: [
        { xpRequired: { $lte: userXp, $gt: 0 } },
        { challengeCount: { $lte: userChallengesCount, $gt: 0 } },
      ],
    });
  }

  async grantBadgeToEmployee(employeeId, badgeId) {
    try {
      return await EmployeeBadge.create({ employeeId, badgeId });
    } catch (err) {
      // Ignore duplicates (unique index will trigger error if already unlocked)
      return null;
    }
  }

  async getEmployeeBadges(employeeId) {
    return await EmployeeBadge.find({ employeeId, isDeleted: false }).populate('badgeId', 'title icon');
  }

  async findAllBadges() {
    return await Badge.find({ isDeleted: false });
  }

  // ==========================================
  // REWARD & REDEMPTION METHODS
  // ==========================================

  async createReward(rewardData) {
    return await Reward.create(rewardData);
  }

  async findRewardById(id) {
    return await Reward.findOne({ _id: id, isDeleted: false });
  }

  async findAllRewards() {
    return await Reward.find({ isDeleted: false, stock: { $gt: 0 } });
  }

  async createRedemption(redemptionData) {
    return await RewardRedemption.create(redemptionData);
  }

  async findRedemptionById(id) {
    return await RewardRedemption.findOne({ _id: id, isDeleted: false }).populate('rewardId', 'title requiredPoints');
  }

  async updateRedemptionStatus(id, status) {
    return await RewardRedemption.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { status } },
      { new: true }
    );
  }

  async updateRewardStock(rewardId, stockChange) {
    return await Reward.findOneAndUpdate(
      { _id: rewardId, isDeleted: false, stock: { $gte: -stockChange } },
      { $inc: { stock: stockChange } },
      { new: true }
    );
  }

  // ==========================================
  // LEADERBOARD METHODS
  // ==========================================

  async getLeaderboard(limit = 10) {
    const User = mongoose.model('User');
    return await User.find({})
      .sort({ xp: -1 })
      .limit(limit)
      .select('name email xp points');
  }
}

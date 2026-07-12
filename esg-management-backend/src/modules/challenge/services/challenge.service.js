import { ChallengeRepository } from '../repositories/challenge.repository.js';
import { ApiError } from '../../../utils/ApiError.js';
import { HTTP_STATUS } from '../../../utils/constants.js';
import { PARTICIPANT_STATUS, EVIDENCE_STATUS, VERIFICATION_STATUS } from '../challenge.constants.js';
import mongoose from 'mongoose';

const challengeRepository = new ChallengeRepository();

export class ChallengeService {
  // ==========================================
  // CHALLENGE & CATEGORY SERVICES
  // ==========================================

  async createChallenge(challengeData) {
    const existing = await challengeRepository.findChallengeByTitle(challengeData.title);
    if (existing) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Challenge with this title already exists');
    }
    return await challengeRepository.createChallenge(challengeData);
  }

  async getChallengeById(id) {
    const challenge = await challengeRepository.findChallengeById(id);
    if (!challenge) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Challenge not found');
    }
    return challenge;
  }

  async listChallenges(query) {
    return await challengeRepository.findAllChallenges(query);
  }

  async updateChallenge(id, updateBody) {
    const challenge = await this.getChallengeById(id);
    if (updateBody.title && updateBody.title.toLowerCase() !== challenge.title.toLowerCase()) {
      const existing = await challengeRepository.findChallengeByTitle(updateBody.title);
      if (existing) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Challenge with this title already exists');
      }
    }
    return await challengeRepository.updateChallenge(id, updateBody);
  }

  async deleteChallenge(id) {
    await this.getChallengeById(id);
    return await challengeRepository.softDeleteChallenge(id);
  }

  async createCategory(categoryData) {
    const existing = await challengeRepository.findCategoryByName(categoryData.name);
    if (existing) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Category already exists');
    }
    return await challengeRepository.createCategory(categoryData);
  }

  async getCategories() {
    return await challengeRepository.findAllCategories();
  }

  // ==========================================
  // PARTICIPATION SERVICES
  // ==========================================

  async joinChallenge(employeeId, challengeId) {
    const challenge = await this.getChallengeById(challengeId);
    if (challenge.status !== 'ACTIVE') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This challenge is inactive');
    }

    const now = new Date();
    if (now > challenge.endDate) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This challenge has already ended');
    }
    if (now < challenge.startDate) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This challenge has not started yet');
    }

    // Check participant limit
    const currentParticipants = await challengeRepository.getParticipantsCount(challengeId);
    if (currentParticipants >= challenge.maxParticipants) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This challenge has reached its maximum participant limit');
    }

    // Prevent duplicate joins
    const alreadyJoined = await challengeRepository.getParticipant(employeeId, challengeId);
    if (alreadyJoined) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You have already joined this challenge');
    }

    const participant = await challengeRepository.joinChallenge(employeeId, challengeId);
    
    // Auto-create progress
    await challengeRepository.createOrUpdateProgress(employeeId, challengeId, 0, 1);

    // If evidence is not required, auto-complete
    if (!challenge.evidenceRequired) {
      await this.completeChallengeWithoutEvidence(employeeId, challengeId, challenge);
    }

    return participant;
  }

  async completeChallengeWithoutEvidence(employeeId, challengeId, challenge) {
    await challengeRepository.updateParticipantStatus(employeeId, challengeId, PARTICIPANT_STATUS.COMPLETED);
    await challengeRepository.createOrUpdateProgress(employeeId, challengeId, 1, 1);

    // Award rewards directly
    await challengeRepository.updateUserBalance(employeeId, challenge.xpReward, challenge.pointsReward);
    await challengeRepository.createXPTransaction({
      employeeId,
      challengeId,
      xpEarned: challenge.xpReward,
      pointsEarned: challenge.pointsReward,
      reason: `Completed challenge: ${challenge.title} (No evidence required)`,
    });

    // Check badges
    await this.checkAndAwardBadges(employeeId);
  }

  async updateProgress(employeeId, challengeId, completedTasks, totalTasks) {
    await this.getChallengeById(challengeId);
    const participant = await challengeRepository.getParticipant(employeeId, challengeId);
    if (!participant) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You must join the challenge first');
    }
    return await challengeRepository.createOrUpdateProgress(employeeId, challengeId, completedTasks, totalTasks);
  }

  // ==========================================
  // EVIDENCE & VERIFICATION SERVICES
  // ==========================================

  async submitEvidence(employeeId, challengeId, fileUrl, fileType, description) {
    const challenge = await this.getChallengeById(challengeId);
    const participant = await challengeRepository.getParticipant(employeeId, challengeId);
    if (!participant) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You must join the challenge to submit evidence');
    }

    if (participant.status === PARTICIPANT_STATUS.COMPLETED) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You have already completed this challenge');
    }

    return await challengeRepository.uploadEvidence({
      challengeId,
      employeeId,
      fileUrl,
      fileType,
      description,
      status: EVIDENCE_STATUS.PENDING,
    });
  }

  async getPendingSubmissions() {
    return await challengeRepository.findAllPendingEvidence();
  }

  async verifyEvidence(evidenceId, adminId, status, remarks) {
    const evidence = await challengeRepository.findEvidenceById(evidenceId);
    if (!evidence) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Evidence not found');
    }

    if (evidence.status !== EVIDENCE_STATUS.PENDING) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Evidence has already been reviewed (Status: ${evidence.status})`);
    }

    // Update evidence status
    await challengeRepository.updateEvidenceStatus(evidenceId, status);

    // Save verification log
    const verification = await challengeRepository.createVerification({
      challengeId: evidence.challengeId,
      employeeId: evidence.employeeId,
      evidenceId,
      reviewedBy: adminId,
      status,
      remarks,
    });

    if (status === VERIFICATION_STATUS.APPROVED) {
      const challenge = await this.getChallengeById(evidence.challengeId);
      
      // Update participant status to completed
      await challengeRepository.updateParticipantStatus(evidence.employeeId, evidence.challengeId, PARTICIPANT_STATUS.COMPLETED);
      
      // Update progress to 100%
      await challengeRepository.createOrUpdateProgress(evidence.employeeId, evidence.challengeId, 1, 1);

      // Award XP & Points
      await challengeRepository.updateUserBalance(evidence.employeeId, challenge.xpReward, challenge.pointsReward);

      // Save XP Transaction
      await challengeRepository.createXPTransaction({
        employeeId: evidence.employeeId,
        challengeId: evidence.challengeId,
        xpEarned: challenge.xpReward,
        pointsEarned: challenge.pointsReward,
        reason: `Evidence approved for: ${challenge.title}`,
      });

      // Check badges
      await this.checkAndAwardBadges(evidence.employeeId);
    }

    return verification;
  }

  // ==========================================
  // BADGE SERVICES
  // ==========================================

  async createBadge(badgeData) {
    return await challengeRepository.createBadge(badgeData);
  }

  async checkAndAwardBadges(employeeId) {
    const User = mongoose.model('User');
    const user = await User.findById(employeeId);
    if (!user) return;

    // Get count of completed challenges
    const completedCount = await mongoose.model('ChallengeParticipant').countDocuments({
      employeeId,
      status: PARTICIPANT_STATUS.COMPLETED,
      isDeleted: false,
    });

    const eligibleBadges = await challengeRepository.findBadgesToUnlock(user.xp, completedCount);
    for (const badge of eligibleBadges) {
      await challengeRepository.grantBadgeToEmployee(employeeId, badge._id);
    }
  }

  async getEmployeeBadges(employeeId) {
    return await challengeRepository.getEmployeeBadges(employeeId);
  }

  // ==========================================
  // REWARDS SERVICES
  // ==========================================

  async createReward(rewardData) {
    return await challengeRepository.createReward(rewardData);
  }

  async listRewards() {
    return await challengeRepository.findAllRewards();
  }

  async redeemReward(employeeId, rewardId) {
    const reward = await challengeRepository.findRewardById(rewardId);
    if (!reward) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Reward not found');
    }

    if (reward.stock <= 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Reward is out of stock');
    }

    const User = mongoose.model('User');
    const user = await User.findById(employeeId);
    if (!user || user.points < reward.requiredPoints) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Insufficient points to redeem this reward');
    }

    // Deduct points from user balance
    await challengeRepository.updateUserBalance(employeeId, 0, -reward.requiredPoints);

    // Decrease reward stock
    await challengeRepository.updateRewardStock(rewardId, -1);

    // Save redemption
    return await challengeRepository.createRedemption({
      rewardId,
      employeeId,
      status: 'APPROVED', // Redeeming instantly approves for digital/voucher rewards
    });
  }

  // ==========================================
  // LEADERBOARD SERVICES
  // ==========================================

  async getLeaderboard(limit) {
    return await challengeRepository.getLeaderboard(limit);
  }
}

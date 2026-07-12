import { RewardRepository } from './reward.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import { REDEMPTION_STATUS } from './reward.constants.js';
import mongoose from 'mongoose';

const rewardRepository = new RewardRepository();

export class RewardService {
  /**
   * Create a new reward (Admin only)
   * @param {object} rewardData 
   * @returns {Promise<object>}
   */
  async createReward(rewardData) {
    const existing = await rewardRepository.findByName(rewardData.name);
    if (existing) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Reward with this name already exists');
    }
    return await rewardRepository.create(rewardData);
  }

  /**
   * List all active rewards
   * @returns {Promise<Array>}
   */
  async listActiveRewards() {
    return await rewardRepository.findAllActive();
  }

  /**
   * Redeem a reward (Employee action)
   * @param {string} employeeId 
   * @param {string} rewardId 
   * @returns {Promise<object>}
   */
  async redeemReward(employeeId, rewardId) {
    const reward = await rewardRepository.findById(rewardId);
    if (!reward || !reward.isActive) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Reward not found or is inactive');
    }

    if (reward.expiryDate && new Date() > reward.expiryDate) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This reward has expired');
    }

    if (reward.stock <= 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Reward is out of stock');
    }

    // Check if employee has enough points
    const User = mongoose.model('User');
    const user = await User.findById(employeeId);
    if (!user || user.points < reward.requiredPoints) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Insufficient points to redeem this reward');
    }

    // 1. Deduct points from user
    await rewardRepository.updateUserPoints(employeeId, -reward.requiredPoints);

    // 2. Reduce stock by 1
    await rewardRepository.update(rewardId, { stock: reward.stock - 1 });

    // 3. Create redemption record
    return await rewardRepository.createRedemption({
      rewardId,
      employeeId,
      pointsUsed: reward.requiredPoints,
      status: REDEMPTION_STATUS.PENDING,
    });
  }

  /**
   * Fetch current user's redemption history
   * @param {string} employeeId 
   * @returns {Promise<Array>}
   */
  async getMyRedemptions(employeeId) {
    return await rewardRepository.findRedemptionsByEmployee(employeeId);
  }

  /**
   * Get all redemptions (Admin only)
   * @returns {Promise<Array>}
   */
  async getAllRedemptions() {
    return await rewardRepository.findAllRedemptions();
  }

  /**
   * Approve a redemption (Admin only)
   * @param {string} redemptionId 
   * @returns {Promise<object>}
   */
  async approveRedemption(redemptionId) {
    const redemption = await rewardRepository.findRedemptionById(redemptionId);
    if (!redemption) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Redemption request not found');
    }

    if (redemption.status !== REDEMPTION_STATUS.PENDING) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Cannot approve a request that is already ${redemption.status}`);
    }

    return await rewardRepository.updateRedemptionStatus(redemptionId, REDEMPTION_STATUS.APPROVED);
  }

  /**
   * Reject a redemption (Admin only) and refund points
   * @param {string} redemptionId 
   * @returns {Promise<object>}
   */
  async rejectRedemption(redemptionId) {
    const redemption = await rewardRepository.findRedemptionById(redemptionId);
    if (!redemption) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Redemption request not found');
    }

    if (redemption.status !== REDEMPTION_STATUS.PENDING) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Cannot reject a request that is already ${redemption.status}`);
    }

    // 1. Refund the points to the user
    await rewardRepository.updateUserPoints(redemption.employeeId._id, redemption.pointsUsed);

    // 2. Put stock back (increment stock by 1)
    const reward = await rewardRepository.findById(redemption.rewardId._id);
    if (reward) {
      await rewardRepository.update(reward._id, { stock: reward.stock + 1 });
    }

    // 3. Mark status as REJECTED
    return await rewardRepository.updateRedemptionStatus(redemptionId, REDEMPTION_STATUS.REJECTED);
  }
}

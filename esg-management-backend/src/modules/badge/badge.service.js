import { BadgeRepository } from './badge.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import mongoose from 'mongoose';

const badgeRepository = new BadgeRepository();

export class BadgeService {
  /**
   * Create a new badge (Admin only)
   * @param {object} badgeData 
   * @returns {Promise<object>}
   */
  async createBadge(badgeData) {
    const existing = await badgeRepository.findByName(badgeData.name);
    if (existing) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Badge with this name already exists');
    }
    return await badgeRepository.create(badgeData);
  }

  /**
   * List all active badges
   * @returns {Promise<Array>}
   */
  async listActiveBadges() {
    return await badgeRepository.findAllActive();
  }

  /**
   * Get an employee's badge profile (all earned badges)
   * @param {string} employeeId 
   * @returns {Promise<Array>}
   */
  async getEmployeeBadgeProfile(employeeId) {
    return await badgeRepository.findByEmployeeId(employeeId);
  }

  /**
   * Get the global badge awarding history (Admin only)
   * @returns {Promise<Array>}
   */
  async getHistory() {
    return await badgeRepository.findAllGranted();
  }

  /**
   * Check user stats and award badges dynamically
   * @param {string} employeeId 
   */
  async checkAndAwardBadges(employeeId) {
    const User = mongoose.model('User');
    const user = await User.findById(employeeId);
    if (!user) return;

    // Get count of completed challenges
    const ChallengeParticipant = mongoose.models.ChallengeParticipant;
    let completedCount = 0;
    if (ChallengeParticipant) {
      completedCount = await ChallengeParticipant.countDocuments({
        employeeId,
        status: 'COMPLETED',
        isDeleted: false,
      });
    }

    // Find all active badges
    const allBadges = await badgeRepository.findAllActive();

    // Check badge criteria
    for (const badge of allBadges) {
      const meetsXp = badge.xpRequired > 0 && user.xp >= badge.xpRequired;
      const meetsChallenges = badge.challengeRequired > 0 && completedCount >= badge.challengeRequired;

      if (meetsXp || meetsChallenges) {
        let reason = '';
        if (meetsXp && meetsChallenges) {
          reason = `Earned ${badge.xpRequired} XP and completed ${badge.challengeRequired} challenges`;
        } else if (meetsXp) {
          reason = `Earned ${badge.xpRequired} XP`;
        } else {
          reason = `Completed ${badge.challengeRequired} challenges`;
        }
        await badgeRepository.grantBadge(employeeId, badge._id, reason);
      }
    }
  }
}

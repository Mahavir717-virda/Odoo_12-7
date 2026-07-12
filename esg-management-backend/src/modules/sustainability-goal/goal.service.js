import mongoose from 'mongoose';
import { GoalRepository } from './goal.repository.js';
import { DepartmentRepository } from '../department/department.repository.js';
import {
  calculateProgress,
  calculateAchievementStatus,
  calculateRemainingTarget,
} from './goalCalculator.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const goalRepository = new GoalRepository();
const departmentRepository = new DepartmentRepository();

export class GoalService {
  /**
   * Create a sustainability target
   * @param {object} goalData 
   * @returns {Promise<object>}
   */
  async createGoal(goalData) {
    // 1. Verify code uniqueness
    const existing = await goalRepository.findByCode(goalData.goalCode);
    if (existing) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Goal code '${goalData.goalCode}' already exists`);
    }

    // 2. Validate department reference if supplied
    if (goalData.department) {
      const dept = await departmentRepository.findById(goalData.department);
      if (!dept) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated department not found');
      }
    }

    // 3. Date sequence check
    const startDate = new Date(goalData.startDate);
    const targetDate = new Date(goalData.targetDate);
    if (targetDate <= startDate) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'targetDate must be after startDate');
    }

    // 4. Calculate progress parameters if manually supplied
    let currentValue = goalData.currentValue || 0;
    
    // If autoTrack is enabled, currentValue must be loaded from Carbon Transaction aggregates
    if (goalData.autoTrack) {
      currentValue = await this.aggregateAutoTrackValue(goalData);
    }

    const progressPercentage = calculateProgress(currentValue, goalData.targetValue);
    const achievementStatus = calculateAchievementStatus(currentValue, goalData.targetValue, goalData.targetDate, goalData.status);

    const finalGoal = {
      ...goalData,
      currentValue,
      progressPercentage,
      achievementStatus,
    };

    return await goalRepository.create(finalGoal);
  }

  /**
   * Aggregate actual calculated emission totals matching the goal type
   * @param {object} goal 
   * @returns {Promise<number>} sum value
   */
  async aggregateAutoTrackValue(goal) {
    // Determine filters matching goal department
    const matchFilters = {
      isDeleted: false,
    };
    if (goal.department) {
      matchFilters.department = new mongoose.Types.ObjectId(goal.department);
    }

    // Map goal target types to activityType enums in Carbon Transactions
    let targetActivityType = null;
    if (goal.goalType === 'CARBON_REDUCTION') targetActivityType = 'MANUAL'; // or matching type
    if (goal.goalType === 'ENERGY_REDUCTION') targetActivityType = 'ENERGY';
    if (goal.goalType === 'WASTE_REDUCTION') targetActivityType = 'EXPENSE';
    if (goal.goalType === 'WATER_SAVING') targetActivityType = 'MANUFACTURING';
    if (goal.goalType === 'RECYCLING') targetActivityType = 'PURCHASE';

    if (targetActivityType) {
      matchFilters.activityType = targetActivityType;
    }

    // Restrict within timeline boundaries of the goal target window
    matchFilters.transactionDate = {
      $gte: new Date(goal.startDate),
      $lte: new Date(goal.targetDate),
    };

    const aggregates = await mongoose.model('CarbonTransaction').aggregate([
      { $match: matchFilters },
      {
        $group: {
          _id: null,
          total: { $sum: '$calculatedEmission' },
        },
      },
    ]);

    return aggregates.length > 0 ? aggregates[0].total : 0;
  }

  /**
   * Get goals with paginated filters
   * @param {object} query 
   * @returns {Promise<object>}
   */
  async queryGoals(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const sortBy = query.sortBy || 'targetDate';
    const order = query.order === 'desc' ? 'desc' : 'asc';
    const search = query.search || '';

    return await goalRepository.findAll({
      page,
      limit,
      sortBy,
      order,
      search,
      department: query.department,
      goalType: query.goalType,
      priority: query.priority,
      status: query.status,
      achievementStatus: query.achievementStatus,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  /**
   * Get Goal by ID
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async getGoalById(id) {
    const goal = await goalRepository.findById(id);
    if (!goal) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sustainability goal not found');
    }
    return goal;
  }

  /**
   * Update Goal details
   * @param {string} id 
   * @param {object} updateBody 
   * @returns {Promise<object>}
   */
  async updateGoal(id, updateBody) {
    const goal = await this.getGoalById(id);

    // Validate code uniqueness if changing
    if (updateBody.goalCode && updateBody.goalCode.toUpperCase() !== goal.goalCode.toUpperCase()) {
      const existing = await goalRepository.findByCode(updateBody.goalCode);
      if (existing) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Goal code '${updateBody.goalCode}' already exists`);
      }
    }

    // Validate department reference if changing
    if (updateBody.department) {
      const dept = await departmentRepository.findById(updateBody.department);
      if (!dept) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated department not found');
      }
    }

    // Validate date sequence if updated
    const startDate = updateBody.startDate ? new Date(updateBody.startDate) : new Date(goal.startDate);
    const targetDate = updateBody.targetDate ? new Date(updateBody.targetDate) : new Date(goal.targetDate);
    if (targetDate <= startDate) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'targetDate must be after startDate');
    }

    // Evaluate track parameters changes
    const autoTrack = updateBody.autoTrack !== undefined ? updateBody.autoTrack : goal.autoTrack;
    let currentValue = updateBody.currentValue !== undefined ? updateBody.currentValue : goal.currentValue;
    const targetValue = updateBody.targetValue !== undefined ? updateBody.targetValue : goal.targetValue;

    if (autoTrack) {
      if (updateBody.currentValue !== undefined && updateBody.currentValue !== goal.currentValue) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Manual updates to currentValue are not allowed when autoTrack is enabled');
      }
      // Re-calculate currentValue from Carbon Transactions
      const mergedGoalObject = { ...goal, ...updateBody, startDate, targetDate };
      currentValue = await this.aggregateAutoTrackValue(mergedGoalObject);
    }

    const progressPercentage = calculateProgress(currentValue, targetValue);
    const achievementStatus = calculateAchievementStatus(currentValue, targetValue, targetDate, updateBody.status || goal.status);

    updateBody.currentValue = currentValue;
    updateBody.progressPercentage = progressPercentage;
    updateBody.achievementStatus = achievementStatus;

    return await goalRepository.update(id, updateBody);
  }

  /**
   * Soft delete Goal
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async deleteGoal(id) {
    await this.getGoalById(id);
    return await goalRepository.softDelete(id);
  }

  /**
   * Recalculate autoTrack goals progress values
   * @returns {Promise<object>} summary count
   */
  async recalculateProgressValues() {
    const activeAutoGoals = await goalRepository.findAutoTrackableGoals();
    let updatedCount = 0;

    for (const goal of activeAutoGoals) {
      const currentValue = await this.aggregateAutoTrackValue(goal);
      const progressPercentage = calculateProgress(currentValue, goal.targetValue);
      const achievementStatus = calculateAchievementStatus(currentValue, goal.targetValue, goal.targetDate, goal.status);

      await goalRepository.update(goal._id, {
        currentValue,
        progressPercentage,
        achievementStatus,
      });
      updatedCount++;
    }

    return { updatedCount };
  }

  /**
   * Fetch analytical aggregates overview
   * @param {object} query 
   * @returns {Promise<object>}
   */
  async getStatistics(query = {}) {
    const filters = {};
    if (query.department) filters.department = new mongoose.Types.ObjectId(query.department);
    if (query.goalType) filters.goalType = query.goalType;
    if (query.priority) filters.priority = query.priority;
    if (query.status) filters.status = query.status;

    return await goalRepository.getStatistics(filters);
  }
}
export default GoalService;

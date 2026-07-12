import mongoose from 'mongoose';
import { Goal } from './goal.model.js';

export class GoalRepository {
  /**
   * Create a new Goal
   * @param {object} goalData 
   * @returns {Promise<object>}
   */
  async create(goalData) {
    return await Goal.create(goalData);
  }

  /**
   * Find a Goal by code
   * @param {string} goalCode 
   * @returns {Promise<object|null>}
   */
  async findByCode(goalCode) {
    return await Goal.findOne({ goalCode: goalCode.toUpperCase(), isDeleted: false }).lean();
  }

  /**
   * Find a Goal by ID
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return await Goal.findOne({ _id: id, isDeleted: false })
      .populate('department', 'name code')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();
  }

  /**
   * List goals with sorting, filters, search and pagination
   * @param {object} options 
   * @returns {Promise<object>}
   */
  async findAll({ page = 1, limit = 10, sortBy = 'targetDate', order = 'asc', search = '', department, goalType, priority, status, achievementStatus, startDate, endDate }) {
    const query = { isDeleted: false };

    // Search mapping
    if (search) {
      query.$or = [
        { goalCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Direct filters
    if (department) query.department = department;
    if (goalType) query.goalType = goalType;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (achievementStatus) query.achievementStatus = achievementStatus;

    // Date range filter
    if (startDate || endDate) {
      query.targetDate = {};
      if (startDate) {
        query.targetDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.targetDate.$lte = new Date(endDate);
      }
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const projection = {
      goalCode: 1,
      title: 1,
      description: 1,
      department: 1,
      goalType: 1,
      baselineValue: 1,
      targetValue: 1,
      currentValue: 1,
      unit: 1,
      startDate: 1,
      targetDate: 1,
      priority: 1,
      status: 1,
      progressPercentage: 1,
      achievementStatus: 1,
      autoTrack: 1,
      createdAt: 1,
    };

    const [results, totalRecords] = await Promise.all([
      Goal.find(query, projection)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('department', 'name code')
        .lean(),
      Goal.countDocuments(query),
    ]);

    return {
      results,
      totalRecords,
      limit,
      page,
      totalPages: Math.ceil(totalRecords / limit),
    };
  }

  /**
   * Update Goal details
   * @param {string} id 
   * @param {object} updateData 
   * @returns {Promise<object|null>}
   */
  async update(id, updateData) {
    return await Goal.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .lean();
  }

  /**
   * Soft delete Goal
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async softDelete(id) {
    return await Goal.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    ).lean();
  }

  /**
   * Fetch statistics overview grouping
   * @param {object} filters 
   * @returns {Promise<object>}
   */
  async getStatistics(filters = {}) {
    const query = { isDeleted: false, ...filters };

    const [totals, progressAvg, deptProgress] = await Promise.all([
      // Count totals grouped by status
      Goal.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Average progress percentage
      Goal.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            avgProgress: { $avg: '$progressPercentage' },
            completedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
            },
            total: { $sum: 1 }
          },
        },
      ]),

      // Department Wise Progress average values
      Goal.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$department',
            avgProgress: { $avg: '$progressPercentage' },
            count: { $sum: 1 }
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'departmentDetails',
          },
        },
        { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            departmentName: { $ifNull: ['$departmentDetails.name', 'Global'] },
            avgProgress: { $round: ['$avgProgress', 2] },
            count: 1
          }
        }
      ])
    ]);

    // Format status groupings
    let totalGoals = 0;
    let completedGoals = 0;
    let failedGoals = 0;
    let activeGoals = 0;

    totals.forEach((item) => {
      totalGoals += item.count;
      if (item._id === 'COMPLETED') completedGoals = item.count;
      if (item._id === 'FAILED') failedGoals = item.count;
      if (item._id === 'ACTIVE') activeGoals = item.count;
    });

    const averageProgress = progressAvg.length > 0 ? Number(progressAvg[0].avgProgress.toFixed(2)) : 0;
    const totalCountVal = progressAvg.length > 0 ? progressAvg[0].total : 0;
    const completedCountVal = progressAvg.length > 0 ? progressAvg[0].completedCount : 0;
    const goalCompletionRate = totalCountVal > 0 ? Number(((completedCountVal / totalCountVal) * 100).toFixed(2)) : 0;

    return {
      totalGoals,
      completedGoals,
      failedGoals,
      activeGoals,
      averageProgress,
      goalCompletionRate,
      departmentWiseProgress: deptProgress,
    };
  }

  /**
   * Fetch goals eligible for automatic tracking
   * @returns {Promise<Array>}
   */
  async findAutoTrackableGoals() {
    return await Goal.find({ isDeleted: false, autoTrack: true, status: 'ACTIVE' }).lean();
  }
}

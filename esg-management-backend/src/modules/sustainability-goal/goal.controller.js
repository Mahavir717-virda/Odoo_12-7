import { validationResult } from 'express-validator';
import { GoalService } from './goal.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const goalService = new GoalService();

/**
 * Validates request payload against express-validator rules.
 * Throws ApiError if errors exist.
 */
const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Validation failed', true, '', formattedErrors);
  }
};

export class GoalController {
  /**
   * Create Goal Handler
   */
  createGoal = asyncHandler(async (req, res) => {
    validateRequest(req);
    const goal = await goalService.createGoal(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, goal, 'Sustainability goal created successfully')
    );
  });

  /**
   * Get All Goals Handler
   */
  getGoals = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await goalService.queryGoals(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Sustainability goals retrieved successfully')
    );
  });

  /**
   * Get Goal By ID Handler
   */
  getGoalById = asyncHandler(async (req, res) => {
    validateRequest(req);
    const goal = await goalService.getGoalById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, goal, 'Sustainability goal retrieved successfully')
    );
  });

  /**
   * Update Goal Handler
   */
  updateGoal = asyncHandler(async (req, res) => {
    validateRequest(req);
    const goal = await goalService.updateGoal(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, goal, 'Sustainability goal updated successfully')
    );
  });

  /**
   * Delete Goal Handler
   */
  deleteGoal = asyncHandler(async (req, res) => {
    validateRequest(req);
    await goalService.deleteGoal(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Sustainability goal deleted successfully')
    );
  });

  /**
   * Get Goal Statistics Handler
   */
  getStatistics = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await goalService.getStatistics(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Sustainability goal statistics retrieved successfully')
    );
  });

  /**
   * Get Dashboard Charts Aggregation Handler (same as statistics for dashboard compatibility)
   */
  getDashboard = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await goalService.getStatistics(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Sustainability goal dashboard retrieved successfully')
    );
  });

  /**
   * Force Recalculate Auto Tracked Goals Handler
   */
  recalculateGoals = asyncHandler(async (req, res) => {
    const result = await goalService.recalculateProgressValues();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Sustainability goals recalculated successfully')
    );
  });
}
export default GoalController;

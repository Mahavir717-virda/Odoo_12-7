import { validationResult } from 'express-validator';
import { BadgeService } from './badge.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const badgeService = new BadgeService();

const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, errorMsg);
  }
};

const MOCK_USER_ID = '663333333333333333333333';
const MOCK_ADMIN_ID = '664444444444444444444444';

export class BadgeController {
  createBadge = asyncHandler(async (req, res) => {
    validateRequest(req);
    const adminId = req.user?._id || MOCK_ADMIN_ID;
    const badge = await badgeService.createBadge({ ...req.body, createdBy: adminId });
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, badge, 'Badge created successfully')
    );
  });

  listBadges = asyncHandler(async (req, res) => {
    const badges = await badgeService.listActiveBadges();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, badges, 'Active badges retrieved successfully')
    );
  });

  getProfile = asyncHandler(async (req, res) => {
    validateRequest(req);
    const employeeId = req.user?._id || req.query.employeeId || MOCK_USER_ID;
    const profile = await badgeService.getEmployeeBadgeProfile(employeeId);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, profile, 'Employee badge profile retrieved successfully')
    );
  });

  getHistory = asyncHandler(async (req, res) => {
    const history = await badgeService.getHistory();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, history, 'Badge award history retrieved successfully')
    );
  });

  checkBadges = asyncHandler(async (req, res) => {
    const employeeId = req.user?._id || req.body.employeeId || MOCK_USER_ID;
    await badgeService.checkAndAwardBadges(employeeId);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Badge check and evaluation completed')
    );
  });
}

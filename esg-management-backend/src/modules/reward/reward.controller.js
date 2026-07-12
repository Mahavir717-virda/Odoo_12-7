import { validationResult } from 'express-validator';
import { RewardService } from './reward.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const rewardService = new RewardService();

const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, errorMsg);
  }
};

const MOCK_USER_ID = '663333333333333333333333';

export class RewardController {
  createReward = asyncHandler(async (req, res) => {
    validateRequest(req);
    const reward = await rewardService.createReward(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, reward, 'Reward created successfully')
    );
  });

  listRewards = asyncHandler(async (req, res) => {
    const rewards = await rewardService.listActiveRewards();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, rewards, 'Active rewards retrieved successfully')
    );
  });

  redeemReward = asyncHandler(async (req, res) => {
    validateRequest(req);
    const employeeId = req.user?._id || req.body.employeeId || MOCK_USER_ID;
    const { rewardId } = req.body;
    const redemption = await rewardService.redeemReward(employeeId, rewardId);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, redemption, 'Redemption request created successfully')
    );
  });

  getMyRedemptions = asyncHandler(async (req, res) => {
    const employeeId = req.user?._id || MOCK_USER_ID;
    const redemptions = await rewardService.getMyRedemptions(employeeId);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, redemptions, 'Redemptions history retrieved successfully')
    );
  });

  getAllRedemptions = asyncHandler(async (req, res) => {
    const redemptions = await rewardService.getAllRedemptions();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, redemptions, 'All redemptions retrieved successfully')
    );
  });

  approveRedemption = asyncHandler(async (req, res) => {
    validateRequest(req);
    const redemption = await rewardService.approveRedemption(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, redemption, 'Redemption approved successfully')
    );
  });

  rejectRedemption = asyncHandler(async (req, res) => {
    validateRequest(req);
    const redemption = await rewardService.rejectRedemption(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, redemption, 'Redemption rejected successfully')
    );
  });
}

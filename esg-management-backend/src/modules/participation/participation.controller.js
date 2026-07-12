import { validationResult } from 'express-validator';
import { ParticipationService } from './participation.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const participationService = new ParticipationService();

const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, errorMsg);
  }
};

// Fallbacks for testing without a fully configured Auth middleware
const MOCK_USER_ID = '663333333333333333333333';
const MOCK_ADMIN_ID = '664444444444444444444444';

export class ParticipationController {
  /**
   * Join activity handler. Supports evidence uploads via multipart/form-data.
   */
  joinActivity = asyncHandler(async (req, res) => {
    validateRequest(req);
    const userId = req.user?._id || req.body.employeeId || MOCK_USER_ID;
    const { activityId } = req.body;
    
    // Check if proof file was uploaded
    const proof = req.file ? req.file.filename : null;

    const participation = await participationService.joinActivity(userId, activityId, proof);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, participation, 'Joined activity successfully')
    );
  });

  /**
   * Approve pending request handler
   */
  approveParticipation = asyncHandler(async (req, res) => {
    validateRequest(req);
    const adminId = req.user?._id || req.body.adminId || MOCK_ADMIN_ID;
    const participation = await participationService.approveParticipation(req.params.id, adminId);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, participation, 'Participation request approved successfully')
    );
  });

  /**
   * Reject pending request handler
   */
  rejectParticipation = asyncHandler(async (req, res) => {
    validateRequest(req);
    const adminId = req.user?._id || req.body.adminId || MOCK_ADMIN_ID;
    const { rejectionReason } = req.body;
    const participation = await participationService.rejectParticipation(req.params.id, adminId, rejectionReason);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, participation, 'Participation request rejected successfully')
    );
  });

  /**
   * Get all/filtered participations handler
   */
  getParticipations = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await participationService.queryParticipations(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Participations retrieved successfully')
    );
  });

  /**
   * Get participation by ID handler
   */
  getParticipationById = asyncHandler(async (req, res) => {
    validateRequest(req);
    const participation = await participationService.getParticipationById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, participation, 'Participation retrieved successfully')
    );
  });
}

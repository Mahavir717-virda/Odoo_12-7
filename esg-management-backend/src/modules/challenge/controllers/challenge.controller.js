import { validationResult } from 'express-validator';
import { ChallengeService } from '../services/challenge.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { ApiError } from '../../../utils/ApiError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../utils/constants.js';

const challengeService = new ChallengeService();

const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, errorMsg);
  }
};

const MOCK_USER_ID = '663333333333333333333333';
const MOCK_ADMIN_ID = '664444444444444444444444';

export class ChallengeController {
  // ==========================================
  // CHALLENGE & CATEGORY CONTROLLERS
  // ==========================================

  createChallenge = asyncHandler(async (req, res) => {
    validateRequest(req);
    const adminId = req.user?._id || MOCK_ADMIN_ID;
    const challenge = await challengeService.createChallenge({ ...req.body, createdBy: adminId });
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, challenge, 'Challenge created successfully')
    );
  });

  getChallenges = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await challengeService.listChallenges(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Challenges retrieved successfully')
    );
  });

  getChallengeById = asyncHandler(async (req, res) => {
    validateRequest(req);
    const challenge = await challengeService.getChallengeById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, challenge, 'Challenge retrieved successfully')
    );
  });

  updateChallenge = asyncHandler(async (req, res) => {
    validateRequest(req);
    const challenge = await challengeService.updateChallenge(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, challenge, 'Challenge updated successfully')
    );
  });

  deleteChallenge = asyncHandler(async (req, res) => {
    validateRequest(req);
    await challengeService.deleteChallenge(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Challenge deleted successfully')
    );
  });

  createCategory = asyncHandler(async (req, res) => {
    validateRequest(req);
    const category = await challengeService.createCategory(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, category, 'Category created successfully')
    );
  });

  getCategories = asyncHandler(async (req, res) => {
    const categories = await challengeService.getCategories();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, categories, 'Categories retrieved successfully')
    );
  });

  // ==========================================
  // JOIN & PARTICIPATION CONTROLLERS
  // ==========================================

  joinChallenge = asyncHandler(async (req, res) => {
    validateRequest(req);
    const employeeId = req.user?._id || req.body.employeeId || MOCK_USER_ID;
    const { challengeId } = req.body;
    const participant = await challengeService.joinChallenge(employeeId, challengeId);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, participant, 'Successfully joined challenge')
    );
  });

  getParticipants = asyncHandler(async (req, res) => {
    const { challengeId, status } = req.query;
    const participants = await challengeService.listParticipants({ challengeId, status });
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, participants, 'Challenge participants retrieved')
    );
  });

  approveParticipant = asyncHandler(async (req, res) => {
    const participant = await challengeService.approveParticipant(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, participant, 'Participant approved and XP awarded')
    );
  });

  updateProgress = asyncHandler(async (req, res) => {
    validateRequest(req);
    const employeeId = req.user?._id || req.body.employeeId || MOCK_USER_ID;
    const { challengeId, completedTasks, totalTasks } = req.body;
    const progress = await challengeService.updateProgress(employeeId, challengeId, completedTasks, totalTasks);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, progress, 'Challenge progress updated')
    );
  });

  // ==========================================
  // EVIDENCE & VERIFICATION CONTROLLERS
  // ==========================================

  submitEvidence = asyncHandler(async (req, res) => {
    validateRequest(req);
    const employeeId = req.user?._id || req.body.employeeId || MOCK_USER_ID;
    const { challengeId, fileType, description } = req.body;
    
    // Support file from multer
    const fileUrl = req.file ? req.file.filename : req.body.fileUrl;
    if (!fileUrl) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Evidence proof file is required');
    }

    const evidence = await challengeService.submitEvidence(employeeId, challengeId, fileUrl, fileType, description);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, evidence, 'Evidence submitted successfully')
    );
  });

  getPendingSubmissions = asyncHandler(async (req, res) => {
    const submissions = await challengeService.getPendingSubmissions();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, submissions, 'Pending evidence submissions retrieved')
    );
  });

  verifyEvidence = asyncHandler(async (req, res) => {
    validateRequest(req);
    const adminId = req.user?._id || req.body.adminId || MOCK_ADMIN_ID;
    const { status, remarks } = req.body;
    const verification = await challengeService.verifyEvidence(req.params.id, adminId, status, remarks);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, verification, `Evidence request ${status.toLowerCase()} successfully`)
    );
  });

  // ==========================================
  // BADGES CONTROLLERS
  // ==========================================

  createBadge = asyncHandler(async (req, res) => {
    validateRequest(req);
    const badge = await challengeService.createBadge(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, badge, 'Badge definition created')
    );
  });

  getEmployeeBadges = asyncHandler(async (req, res) => {
    const employeeId = req.user?._id || req.params.employeeId || MOCK_USER_ID;
    const badges = await challengeService.getEmployeeBadges(employeeId);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, badges, 'Employee badges retrieved')
    );
  });

  getBadges = asyncHandler(async (req, res) => {
    const badges = await challengeService.listBadges();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, badges, 'Badge definitions retrieved successfully')
    );
  });

  // ==========================================
  // REWARDS CONTROLLERS
  // ==========================================

  createReward = asyncHandler(async (req, res) => {
    validateRequest(req);
    const reward = await challengeService.createReward(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, reward, 'Reward definition created')
    );
  });

  getRewards = asyncHandler(async (req, res) => {
    const rewards = await challengeService.listRewards();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, rewards, 'Rewards retrieved successfully')
    );
  });

  redeemReward = asyncHandler(async (req, res) => {
    validateRequest(req);
    const employeeId = req.user?._id || req.body.employeeId || MOCK_USER_ID;
    const { rewardId } = req.body;
    const redemption = await challengeService.redeemReward(employeeId, rewardId);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, redemption, 'Reward redeemed successfully')
    );
  });

  // ==========================================
  // LEADERBOARD CONTROLLERS
  // ==========================================

  getLeaderboard = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const leaderboard = await challengeService.getLeaderboard(limit);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, leaderboard, 'Leaderboard retrieved successfully')
    );
  });
}

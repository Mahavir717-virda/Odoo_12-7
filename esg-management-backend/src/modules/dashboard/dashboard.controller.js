import { DashboardService } from './dashboard.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const dashboardService = new DashboardService();

export class DashboardController {
  getSummary = asyncHandler(async (req, res) => {
    const summary = await dashboardService.getSummary();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, summary, 'ESG summary counters retrieved successfully')
    );
  });

  getCompliance = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getComplianceStats();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, stats, 'Compliance metrics retrieved successfully')
    );
  });

  getChallenges = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getChallengeStats();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, stats, 'Challenge metrics retrieved successfully')
    );
  });

  getBadges = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getBadgeStats();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, stats, 'Badge metrics retrieved successfully')
    );
  });

  getRewards = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getRewardStats();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, stats, 'Reward metrics retrieved successfully')
    );
  });

  getPolicies = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getPolicyStats();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, stats, 'Policy metrics retrieved successfully')
    );
  });

  getAudits = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getAuditStats();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, stats, 'Audit metrics retrieved successfully')
    );
  });

  getEmployees = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getEmployeeStats();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, stats, 'Leaderboard details retrieved successfully')
    );
  });

  getCharts = asyncHandler(async (req, res) => {
    const charts = await dashboardService.getChartData();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, charts, 'Dynamic charts analytics retrieved successfully')
    );
  });
}

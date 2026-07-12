import { validationResult } from 'express-validator';
import { ComplianceService } from './compliance.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const complianceService = new ComplianceService();

const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, errorMsg);
  }
};

const MOCK_USER_ID = '663333333333333333333333';
const MOCK_ADMIN_ID = '664444444444444444444444';

export class ComplianceController {
  createIssue = asyncHandler(async (req, res) => {
    validateRequest(req);
    const creatorId = req.user?._id || MOCK_ADMIN_ID;
    const issue = await complianceService.createIssue({ ...req.body, reportedBy: creatorId });
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, issue, 'Compliance issue created successfully')
    );
  });

  listIssues = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await complianceService.listIssues(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Compliance issues retrieved successfully')
    );
  });

  getIssueById = asyncHandler(async (req, res) => {
    validateRequest(req);
    const issue = await complianceService.getIssueById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, issue, 'Compliance issue retrieved successfully')
    );
  });

  assignIssue = asyncHandler(async (req, res) => {
    validateRequest(req);
    const adminId = req.user?._id || req.body.adminId || MOCK_ADMIN_ID;
    const { employeeId } = req.body;
    const updated = await complianceService.assignIssue(req.params.id, employeeId, adminId);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, updated, 'Compliance issue assigned successfully')
    );
  });

  addProgressUpdate = asyncHandler(async (req, res) => {
    validateRequest(req);
    const employeeId = req.user?._id || req.body.employeeId || MOCK_USER_ID;
    
    // Support file uploads (evidence/attachments)
    const attachment = req.file ? req.file.filename : req.body.attachment;
    const updateData = { ...req.body };
    if (attachment) updateData.attachment = attachment;

    const update = await complianceService.addProgressUpdate(req.params.id, employeeId, updateData);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, update, 'Progress update added successfully')
    );
  });

  verifyResolution = asyncHandler(async (req, res) => {
    validateRequest(req);
    const adminId = req.user?._id || req.body.adminId || MOCK_ADMIN_ID;
    const { status, remarks } = req.body;
    const updated = await complianceService.verifyIssueResolution(req.params.id, adminId, status, remarks);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, updated, `Compliance issue status resolved as: ${status}`)
    );
  });

  resolveIssue = asyncHandler(async (req, res) => {
    validateRequest(req);
    const adminId = req.user?._id || MOCK_ADMIN_ID;
    const { Compliance } = await import('./compliance.model.js');
    const updated = await Compliance.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'Resolved', verifiedBy: adminId, verifiedAt: new Date() } },
      { new: true }
    );
    if (!updated) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Compliance issue not found');
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, updated, 'Compliance issue marked as Resolved')
    );
  });

  getReportsSummary = asyncHandler(async (req, res) => {
    const summary = await complianceService.getReports();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, summary, 'Compliance summary reports retrieved successfully')
    );
  });

  getHistory = asyncHandler(async (req, res) => {
    validateRequest(req);
    const history = await complianceService.getHistory(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, history, 'Compliance state changes history retrieved')
    );
  });
}

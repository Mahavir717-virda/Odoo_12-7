import { validationResult } from 'express-validator';
import { PolicyService } from './policy.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const policyService = new PolicyService();

const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, errorMsg);
  }
};

const MOCK_USER_ID = '663333333333333333333333';
const MOCK_ADMIN_ID = '664444444444444444444444';

export class PolicyController {
  createPolicy = asyncHandler(async (req, res) => {
    validateRequest(req);
    const adminId = req.user?._id || MOCK_ADMIN_ID;
    
    // Support file uploads (PDF document)
    const documentUrl = req.file ? req.file.filename : req.body.documentUrl;

    const policy = await policyService.createPolicy({
      ...req.body,
      documentUrl,
      createdBy: adminId,
    });
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, policy, 'Policy created successfully')
    );
  });

  getPolicies = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await policyService.listPolicies(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Policies retrieved successfully')
    );
  });

  getPolicyById = asyncHandler(async (req, res) => {
    validateRequest(req);
    const policy = await policyService.getPolicyById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, policy, 'Policy retrieved successfully')
    );
  });

  updatePolicy = asyncHandler(async (req, res) => {
    validateRequest(req);
    
    // Support file uploads on update
    const documentUrl = req.file ? req.file.filename : req.body.documentUrl;
    const updateData = { ...req.body };
    if (documentUrl) updateData.documentUrl = documentUrl;

    const policy = await policyService.updatePolicy(req.params.id, updateData);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, policy, 'Policy updated successfully')
    );
  });

  acknowledgePolicy = asyncHandler(async (req, res) => {
    validateRequest(req);
    const employeeId = req.user?._id || req.body.employeeId || MOCK_USER_ID;
    const acknowledgement = await policyService.acknowledgePolicy(employeeId, req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, acknowledgement, 'Policy acknowledged successfully')
    );
  });

  getReportsSummary = asyncHandler(async (req, res) => {
    const summary = await policyService.getReports();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, summary, 'Policy summary reports retrieved successfully')
    );
  });
}

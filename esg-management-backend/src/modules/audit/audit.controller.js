import { validationResult } from 'express-validator';
import { AuditService } from './audit.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const auditService = new AuditService();

const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, errorMsg);
  }
};

const MOCK_ADMIN_ID = '664444444444444444444444';

export class AuditController {
  scheduleAudit = asyncHandler(async (req, res) => {
    validateRequest(req);
    const creatorId = req.user?._id || MOCK_ADMIN_ID;
    const audit = await auditService.scheduleAudit({ ...req.body, createdBy: creatorId });
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, audit, 'Audit scheduled successfully')
    );
  });

  listAudits = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await auditService.listAudits(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Audits retrieved successfully')
    );
  });

  getAuditById = asyncHandler(async (req, res) => {
    validateRequest(req);
    const audit = await auditService.getAuditById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, audit, 'Audit details retrieved successfully')
    );
  });

  addFinding = asyncHandler(async (req, res) => {
    validateRequest(req);
    
    // Support file uploads (evidence image of the finding)
    const evidenceUrl = req.file ? req.file.filename : req.body.evidenceUrl;

    const finding = await auditService.addFinding({
      ...req.body,
      auditId: req.params.id,
      evidenceUrl,
    });
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, finding, 'Finding added successfully')
    );
  });

  getFindings = asyncHandler(async (req, res) => {
    validateRequest(req);
    const findings = await auditService.getFindings(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, findings, 'Findings retrieved successfully')
    );
  });

  assignAction = asyncHandler(async (req, res) => {
    validateRequest(req);
    const action = await auditService.assignCorrectiveAction(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, action, 'Corrective action assigned successfully')
    );
  });

  resolveAction = asyncHandler(async (req, res) => {
    validateRequest(req);
    const action = await auditService.resolveCorrectiveAction(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, action, 'Corrective action resolved successfully')
    );
  });

  verifyAction = asyncHandler(async (req, res) => {
    validateRequest(req);
    const { status } = req.body;
    const action = await auditService.verifyCorrectiveAction(req.params.id, status);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, action, `Corrective action verification resolved as: ${status}`)
    );
  });

  getReportsSummary = asyncHandler(async (req, res) => {
    const summary = await auditService.getReports();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, summary, 'Audit summary reports retrieved successfully')
    );
  });
}

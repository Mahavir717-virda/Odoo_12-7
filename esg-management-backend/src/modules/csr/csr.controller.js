import { validationResult } from 'express-validator';
import { CSRService } from './csr.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const csrService = new CSRService();

const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, errorMsg);
  }
};

export class CSRController {
  /**
   * Create CSR Activity Handler
   */
  createCSR = asyncHandler(async (req, res) => {
    validateRequest(req);
    const csr = await csrService.createCSR(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, csr, 'CSR activity created successfully')
    );
  });

  /**
   * Get All CSR Activities Handler
   */
  getCSRs = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await csrService.queryCSRs(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'CSR activities retrieved successfully')
    );
  });

  /**
   * Get CSR Activity By ID Handler
   */
  getCSRById = asyncHandler(async (req, res) => {
    validateRequest(req);
    const csr = await csrService.getCSRById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, csr, 'CSR activity retrieved successfully')
    );
  });

  /**
   * Update CSR Activity Handler
   */
  updateCSR = asyncHandler(async (req, res) => {
    validateRequest(req);
    const csr = await csrService.updateCSR(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, csr, 'CSR activity updated successfully')
    );
  });

  /**
   * Delete CSR Activity Handler
   */
  deleteCSR = asyncHandler(async (req, res) => {
    validateRequest(req);
    await csrService.deleteCSR(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'CSR activity deleted successfully')
    );
  });

  /**
   * Get Diversity metrics
   */
  getDiversity = asyncHandler(async (req, res) => {
    const { Diversity } = await import('./diversity.model.js');
    let record = await Diversity.findOne();
    if (!record) {
      record = await Diversity.create({
        genderFemalePercentage: 48,
        genderMalePercentage: 50,
        genderOtherPercentage: 2,
        veteranPercentage: 5.4,
        activeInclusionPrograms: 8
      });
    }
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, record, 'Diversity metrics retrieved successfully')
    );
  });

  /**
   * Update Diversity metrics
   */
  updateDiversity = asyncHandler(async (req, res) => {
    const { Diversity } = await import('./diversity.model.js');
    let record = await Diversity.findOne();
    if (!record) {
      record = await Diversity.create({});
    }
    const updated = await Diversity.findByIdAndUpdate(record._id, req.body, { new: true, runValidators: true });
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, updated, 'Diversity metrics updated successfully')
    );
  });
}

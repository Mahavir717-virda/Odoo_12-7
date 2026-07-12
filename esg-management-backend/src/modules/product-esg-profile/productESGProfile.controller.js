import { validationResult } from 'express-validator';
import { ProductESGProfileService } from './productESGProfile.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const productESGProfileService = new ProductESGProfileService();

/**
 * Validates request payload against express-validator rules.
 * Throws ApiError if errors exist.
 */
const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, errorMsg);
  }
};

export class ProductESGProfileController {
  /**
   * Create Product ESG Profile Handler
   */
  createProfile = asyncHandler(async (req, res) => {
    validateRequest(req);
    const profile = await productESGProfileService.createProfile(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, profile, 'Product ESG Profile created successfully')
    );
  });

  /**
   * Get All Product ESG Profiles Handler
   */
  getProfiles = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await productESGProfileService.queryProfiles(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Product ESG Profiles retrieved successfully')
    );
  });

  /**
   * Get Product ESG Profile By ID Handler
   */
  getProfileById = asyncHandler(async (req, res) => {
    validateRequest(req);
    const profile = await productESGProfileService.getProfileById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, profile, 'Product ESG Profile retrieved successfully')
    );
  });

  /**
   * Update Product ESG Profile Handler
   */
  updateProfile = asyncHandler(async (req, res) => {
    validateRequest(req);
    const profile = await productESGProfileService.updateProfile(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, profile, 'Product ESG Profile updated successfully')
    );
  });

  /**
   * Delete Product ESG Profile Handler
   */
  deleteProfile = asyncHandler(async (req, res) => {
    validateRequest(req);
    await productESGProfileService.deleteProfile(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Product ESG Profile deleted successfully')
    );
  });
}

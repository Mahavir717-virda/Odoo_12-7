import { validationResult } from 'express-validator';
import { EmissionFactorService } from './emissionFactor.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const emissionFactorService = new EmissionFactorService();

/**
 * Validates request payload against express-validator rules.
 * Throws ApiError if errors exist.
 */
const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Validation failed', true, '', formattedErrors);
  }
};

export class EmissionFactorController {
  /**
   * Create Emission Factor Handler
   */
  createEmissionFactor = asyncHandler(async (req, res) => {
    validateRequest(req);
    const factor = await emissionFactorService.createEmissionFactor(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, factor, 'Emission factor created successfully')
    );
  });

  /**
   * Get All Emission Factors Handler
   */
  getEmissionFactors = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await emissionFactorService.queryEmissionFactors(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Emission factors retrieved successfully')
    );
  });

  /**
   * Get Emission Factor By ID Handler
   */
  getEmissionFactorById = asyncHandler(async (req, res) => {
    validateRequest(req);
    const factor = await emissionFactorService.getEmissionFactorById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, factor, 'Emission factor retrieved successfully')
    );
  });

  /**
   * Update Emission Factor Handler
   */
  updateEmissionFactor = asyncHandler(async (req, res) => {
    validateRequest(req);
    const factor = await emissionFactorService.updateEmissionFactor(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, factor, 'Emission factor updated successfully')
    );
  });

  /**
   * Delete Emission Factor Handler
   */
  deleteEmissionFactor = asyncHandler(async (req, res) => {
    validateRequest(req);
    await emissionFactorService.deleteEmissionFactor(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Emission factor deleted successfully')
    );
  });
}

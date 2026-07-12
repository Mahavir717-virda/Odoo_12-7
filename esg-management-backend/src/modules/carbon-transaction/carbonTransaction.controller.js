import { validationResult } from 'express-validator';
import { CarbonTransactionService } from './carbonTransaction.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const carbonTransactionService = new CarbonTransactionService();

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

export class CarbonTransactionController {
  /**
   * Create Carbon Transaction Handler
   */
  createTransaction = asyncHandler(async (req, res) => {
    validateRequest(req);
    const transaction = await carbonTransactionService.createTransaction(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, transaction, 'Carbon transaction created successfully')
    );
  });

  /**
   * Get All Carbon Transactions Handler
   */
  getTransactions = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await carbonTransactionService.queryTransactions(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Carbon transactions retrieved successfully')
    );
  });

  /**
   * Get Stats Analytics Overview Handler
   */
  getStatistics = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await carbonTransactionService.getStatistics(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Carbon transaction statistics retrieved successfully')
    );
  });

  /**
   * Get Dashboard Charts Aggregation Handler
   */
  getDashboard = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await carbonTransactionService.getDashboardAggregation(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Carbon transaction dashboard data retrieved successfully')
    );
  });

  /**
   * Get Carbon Transaction By ID Handler
   */
  getTransactionById = asyncHandler(async (req, res) => {
    validateRequest(req);
    const transaction = await carbonTransactionService.getTransactionById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, transaction, 'Carbon transaction retrieved successfully')
    );
  });

  /**
   * Update Carbon Transaction Handler
   */
  updateTransaction = asyncHandler(async (req, res) => {
    validateRequest(req);
    const transaction = await carbonTransactionService.updateTransaction(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, transaction, 'Carbon transaction updated successfully')
    );
  });

  /**
   * Delete Carbon Transaction Handler
   */
  deleteTransaction = asyncHandler(async (req, res) => {
    validateRequest(req);
    await carbonTransactionService.deleteTransaction(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Carbon transaction deleted successfully')
    );
  });
}
export default CarbonTransactionController;

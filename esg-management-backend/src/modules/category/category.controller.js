import { validationResult } from 'express-validator';
import { CategoryService } from './category.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const categoryService = new CategoryService();

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

export class CategoryController {
  /**
   * Create Category Handler
   */
  createCategory = asyncHandler(async (req, res) => {
    validateRequest(req);
    const category = await categoryService.createCategory(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, category, 'Category created successfully')
    );
  });

  /**
   * Get All Categories Handler
   */
  getCategories = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await categoryService.queryCategories(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Categories retrieved successfully')
    );
  });

  /**
   * Get Category By ID Handler
   */
  getCategoryById = asyncHandler(async (req, res) => {
    validateRequest(req);
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, category, 'Category retrieved successfully')
    );
  });

  /**
   * Update Category Handler
   */
  updateCategory = asyncHandler(async (req, res) => {
    validateRequest(req);
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, category, 'Category updated successfully')
    );
  });

  /**
   * Delete Category Handler
   */
  deleteCategory = asyncHandler(async (req, res) => {
    validateRequest(req);
    await categoryService.deleteCategory(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Category deleted successfully')
    );
  });
}

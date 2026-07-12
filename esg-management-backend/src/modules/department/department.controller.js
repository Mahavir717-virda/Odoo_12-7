import { validationResult } from 'express-validator';
import { DepartmentService } from './department.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const departmentService = new DepartmentService();

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

export class DepartmentController {
  /**
   * Create Department Handler
   */
  createDepartment = asyncHandler(async (req, res) => {
    validateRequest(req);
    const department = await departmentService.createDepartment(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, department, 'Department created successfully')
    );
  });

  /**
   * Get All Departments Handler
   */
  getDepartments = asyncHandler(async (req, res) => {
    validateRequest(req);
    const result = await departmentService.queryDepartments(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Departments retrieved successfully')
    );
  });

  /**
   * Get Department By ID Handler
   */
  getDepartmentById = asyncHandler(async (req, res) => {
    validateRequest(req);
    const department = await departmentService.getDepartmentById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, department, 'Department retrieved successfully')
    );
  });

  /**
   * Update Department Handler
   */
  updateDepartment = asyncHandler(async (req, res) => {
    validateRequest(req);
    const department = await departmentService.updateDepartment(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, department, 'Department updated successfully')
    );
  });

  /**
   * Delete Department Handler
   */
  deleteDepartment = asyncHandler(async (req, res) => {
    validateRequest(req);
    await departmentService.deleteDepartment(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Department deleted successfully')
    );
  });
}

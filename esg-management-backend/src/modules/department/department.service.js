import { DepartmentRepository } from './department.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const departmentRepository = new DepartmentRepository();

export class DepartmentService {
  /**
   * Create a department
   * @param {object} departmentData 
   * @returns {Promise<object>}
   */
  async createDepartment(departmentData) {
    // Check if name already exists
    const existingName = await departmentRepository.findByName(departmentData.name);
    if (existingName) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Department with this name already exists');
    }

    // Check if code already exists
    const existingCode = await departmentRepository.findByCode(departmentData.code);
    if (existingCode) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Department with this code already exists');
    }

    // Validate parent department if supplied
    if (departmentData.parentDepartment) {
      const parent = await departmentRepository.findById(departmentData.parentDepartment);
      if (!parent) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Parent department not found');
      }
    }

    return await departmentRepository.create(departmentData);
  }

  /**
   * Query departments with filters & pagination
   * @param {object} query 
   * @returns {Promise<object>}
   */
  async queryDepartments(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'asc' ? 'asc' : 'desc';
    const search = query.search || '';
    const status = query.status;
    const parentDepartment = query.parentDepartment;

    return await departmentRepository.findAll({
      page,
      limit,
      sortBy,
      order,
      search,
      status,
      parentDepartment,
    });
  }

  /**
   * Get department by ID
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async getDepartmentById(id) {
    const department = await departmentRepository.findById(id);
    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Department not found');
    }
    return department;
  }

  /**
   * Update department details
   * @param {string} id 
   * @param {object} updateBody 
   * @returns {Promise<object>}
   */
  async updateDepartment(id, updateBody) {
    const department = await this.getDepartmentById(id);

    // If updating name, check for duplicates
    if (updateBody.name && updateBody.name.toLowerCase() !== department.name.toLowerCase()) {
      const existingName = await departmentRepository.findByName(updateBody.name);
      if (existingName) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Department with this name already exists');
      }
    }

    // If updating code, check for duplicates
    if (updateBody.code && updateBody.code.toUpperCase() !== department.code.toUpperCase()) {
      const existingCode = await departmentRepository.findByCode(updateBody.code);
      if (existingCode) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Department with this code already exists');
      }
    }

    // Prevent department from referencing itself as a parent
    if (updateBody.parentDepartment) {
      if (updateBody.parentDepartment.toString() === id.toString()) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'A department cannot be its own parent');
      }

      const parent = await departmentRepository.findById(updateBody.parentDepartment);
      if (!parent) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Parent department not found');
      }
    }

    return await departmentRepository.update(id, updateBody);
  }

  /**
   * Delete department by ID (Soft Delete)
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async deleteDepartment(id) {
    await this.getDepartmentById(id);
    return await departmentRepository.softDelete(id);
  }
}

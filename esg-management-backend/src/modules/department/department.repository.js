import { Department } from './department.model.js';

export class DepartmentRepository {
  /**
   * Create a new Department document
   * @param {object} departmentData 
   * @returns {Promise<object>}
   */
  async create(departmentData) {
    return await Department.create(departmentData);
  }

  /**
   * Find a Department by code (includes soft deleted records check capability if needed)
   * @param {string} code 
   * @param {boolean} includeDeleted
   * @returns {Promise<object|null>}
   */
  async findByCode(code, includeDeleted = false) {
    const filter = { code: code.toUpperCase() };
    if (!includeDeleted) {
      filter.isDeleted = false;
    }
    return await Department.findOne(filter);
  }

  /**
   * Find a Department by name
   * @param {string} name 
   * @param {boolean} includeDeleted
   * @returns {Promise<object|null>}
   */
  async findByName(name, includeDeleted = false) {
    const filter = { name: new RegExp(`^${name.trim()}$`, 'i') };
    if (!includeDeleted) {
      filter.isDeleted = false;
    }
    return await Department.findOne(filter);
  }

  /**
   * Find a Department by ID
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return await Department.findOne({ _id: id, isDeleted: false })
      .populate('parentDepartment', 'name code')
      .populate('head', 'name email');
  }

  /**
   * List departments with pagination, sorting, search and filtering
   * @param {object} options 
   * @returns {Promise<object>} { results, totalCount, limit, page }
   */
  async findAll({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search = '', status, parentDepartment }) {
    const query = { isDeleted: false };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Parent Department filter
    if (parentDepartment) {
      query.parentDepartment = parentDepartment;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const [results, totalCount] = await Promise.all([
      Department.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('parentDepartment', 'name code')
        .populate('head', 'name email'),
      Department.countDocuments(query),
    ]);

    return {
      results,
      totalCount,
      limit,
      page,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * Update Department details
   * @param {string} id 
   * @param {object} updateData 
   * @returns {Promise<object|null>}
   */
  async update(id, updateData) {
    return await Department.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Soft delete Department
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async softDelete(id) {
    return await Department.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );
  }
}

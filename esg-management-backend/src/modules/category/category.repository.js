import { Category } from './category.model.js';

export class CategoryRepository {
  /**
   * Create a new Category
   * @param {object} categoryData 
   * @returns {Promise<object>}
   */
  async create(categoryData) {
    return await Category.create(categoryData);
  }

  /**
   * Find a Category by type and name to enforce unique constraint per type
   * @param {string} type 
   * @param {string} name 
   * @param {boolean} includeDeleted 
   * @returns {Promise<object|null>}
   */
  async findByTypeAndName(type, name, includeDeleted = false) {
    const filter = {
      type,
      name: new RegExp(`^${name.trim()}$`, 'i'),
    };
    if (!includeDeleted) {
      filter.isDeleted = false;
    }
    return await Category.findOne(filter).lean();
  }

  /**
   * Find a Category by ID
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return await Category.findOne({ _id: id, isDeleted: false })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();
  }

  /**
   * List categories with filters, projection, sorting, search and pagination
   * @param {object} options 
   * @returns {Promise<object>}
   */
  async findAll({ page = 1, limit = 10, sortBy = 'sortOrder', order = 'asc', search = '', status, type, startDate, endDate }) {
    const query = { isDeleted: false };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    // Define projection to optimize load
    const projection = {
      name: 1,
      description: 1,
      type: 1,
      status: 1,
      color: 1,
      icon: 1,
      sortOrder: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    const [results, totalRecords] = await Promise.all([
      Category.find(query, projection)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments(query),
    ]);

    return {
      results,
      totalRecords,
      limit,
      page,
      totalPages: Math.ceil(totalRecords / limit),
    };
  }

  /**
   * Update category
   * @param {string} id 
   * @param {object} updateData 
   * @returns {Promise<object|null>}
   */
  async update(id, updateData) {
    return await Category.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Soft delete category
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async softDelete(id) {
    return await Category.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    ).lean();
  }
}

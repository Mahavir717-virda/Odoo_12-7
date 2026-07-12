import { CSR } from './csr.model.js';

export class CSRRepository {
  /**
   * Create a new CSR activity document
   * @param {object} csrData 
   * @returns {Promise<object>}
   */
  async create(csrData) {
    return await CSR.create(csrData);
  }

  /**
   * Find a CSR activity by title
   * @param {string} title 
   * @param {boolean} includeDeleted
   * @returns {Promise<object|null>}
   */
  async findByTitle(title, includeDeleted = false) {
    const filter = { title: new RegExp(`^${title.trim()}$`, 'i') };
    if (!includeDeleted) {
      filter.isDeleted = false;
    }
    return await CSR.findOne(filter);
  }

  /**
   * Find a CSR activity by ID
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return await CSR.findOne({ _id: id, isDeleted: false });
  }

  /**
   * List CSR activities with pagination, sorting, search and filtering
   * @param {object} options 
   * @returns {Promise<object>} { results, totalCount, limit, page, totalPages }
   */
  async findAll({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search = '', status, category }) {
    const query = { isDeleted: false };

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const [results, totalCount] = await Promise.all([
      CSR.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      CSR.countDocuments(query),
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
   * Update CSR activity details
   * @param {string} id 
   * @param {object} updateData 
   * @returns {Promise<object|null>}
   */
  async update(id, updateData) {
    return await CSR.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Soft delete CSR activity
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async softDelete(id) {
    return await CSR.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );
  }
}

import { EmissionFactor } from './emissionFactor.model.js';

export class EmissionFactorRepository {
  /**
   * Create a new Emission Factor
   * @param {object} factorData 
   * @returns {Promise<object>}
   */
  async create(factorData) {
    return await EmissionFactor.create(factorData);
  }

  /**
   * Find an Emission Factor by code
   * @param {string} code 
   * @param {boolean} includeDeleted 
   * @returns {Promise<object|null>}
   */
  async findByCode(code, includeDeleted = false) {
    const filter = { code: code.toUpperCase() };
    if (!includeDeleted) {
      filter.isDeleted = false;
    }
    return await EmissionFactor.findOne(filter).lean();
  }

  /**
   * Check if a default factor exists for the specific sourceType, unit, country, and region
   * @param {string} sourceType 
   * @param {string} unit 
   * @param {string} country 
   * @param {string} region 
   * @returns {Promise<object|null>}
   */
  async findDefaultFactor(sourceType, unit, country, region) {
    return await EmissionFactor.findOne({
      sourceType,
      unit,
      country: country.toUpperCase(),
      region: region.toUpperCase(),
      isDefault: true,
      isDeleted: false,
    }).lean();
  }

  /**
   * Find an Emission Factor by ID
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return await EmissionFactor.findOne({ _id: id, isDeleted: false })
      .populate('category', 'name type')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();
  }

  /**
   * List emission factors with projection, sorting, search and paginated filters
   * @param {object} options
   * @returns {Promise<object>}
   */
  async findAll({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search = '', category, sourceType, status, country, region, unit, effectiveDate }) {
    const query = { isDeleted: false };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Direct filters
    if (category) query.category = category;
    if (sourceType) query.sourceType = sourceType;
    if (status) query.status = status;
    if (country) query.country = country.toUpperCase();
    if (region) query.region = region.toUpperCase();
    if (unit) query.unit = unit;

    // Effective Date check
    if (effectiveDate) {
      const date = new Date(effectiveDate);
      query.effectiveFrom = { $lte: date };
      query.$or = [
        { effectiveTo: null },
        { effectiveTo: { $gte: date } },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const projection = {
      name: 1,
      code: 1,
      description: 1,
      category: 1,
      sourceType: 1,
      unit: 1,
      emissionValue: 1,
      co2Unit: 1,
      effectiveFrom: 1,
      effectiveTo: 1,
      country: 1,
      region: 1,
      isDefault: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    const [results, totalRecords] = await Promise.all([
      EmissionFactor.find(query, projection)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('category', 'name type')
        .lean(),
      EmissionFactor.countDocuments(query),
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
   * Update Emission Factor
   * @param {string} id 
   * @param {object} updateData 
   * @returns {Promise<object|null>}
   */
  async update(id, updateData) {
    return await EmissionFactor.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Soft delete Emission Factor
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async softDelete(id) {
    return await EmissionFactor.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    ).lean();
  }
}

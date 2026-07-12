import { ProductESGProfile } from './productESGProfile.model.js';

export class ProductESGProfileRepository {
  /**
   * Create a new Product ESG Profile
   * @param {object} profileData 
   * @returns {Promise<object>}
   */
  async create(profileData) {
    const profile = await ProductESGProfile.create(profileData);
    // Populate emissionFactor to support virtuals immediately
    return await profile.populate('emissionFactor', 'emissionValue name');
  }

  /**
   * Find a Profile by code
   * @param {string} productCode 
   * @param {boolean} includeDeleted 
   * @returns {Promise<object|null>}
   */
  async findByCode(productCode, includeDeleted = false) {
    const filter = { productCode: productCode.toUpperCase() };
    if (!includeDeleted) {
      filter.isDeleted = false;
    }
    return await ProductESGProfile.findOne(filter).lean({ virtuals: true });
  }

  /**
   * Find a Profile by ID
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    // We populate department and category as well as emissionFactor
    return await ProductESGProfile.findOne({ _id: id, isDeleted: false })
      .populate('department', 'name code')
      .populate('category', 'name type')
      .populate('emissionFactor', 'name code emissionValue unit co2Unit')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
  }

  /**
   * List profiles with searches, filters, sorting and pagination
   * @param {object} options 
   * @returns {Promise<object>}
   */
  async findAll({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search = '', department, category, materialType, productType, status, countryOfOrigin, manufacturer, supplier, carbonNeutral }) {
    const query = { isDeleted: false };

    // Search query mapping
    if (search) {
      query.$or = [
        { productCode: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ];
    }

    // Direct filters
    if (department) query.department = department;
    if (category) query.category = category;
    if (materialType) query.materialType = materialType;
    if (productType) query.productType = productType;
    if (status) query.status = status;
    if (countryOfOrigin) query.countryOfOrigin = countryOfOrigin.toUpperCase();
    if (manufacturer) query.manufacturer = { $regex: manufacturer, $options: 'i' };
    if (supplier) query.supplier = { $regex: supplier, $options: 'i' };
    if (carbonNeutral !== undefined) query.isCarbonNeutral = carbonNeutral;

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const [results, totalRecords] = await Promise.all([
      ProductESGProfile.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('department', 'name code')
        .populate('category', 'name type')
        .populate('emissionFactor', 'name code emissionValue unit co2Unit'),
      ProductESGProfile.countDocuments(query),
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
   * Update Profile
   * @param {string} id 
   * @param {object} updateData 
   * @returns {Promise<object|null>}
   */
  async update(id, updateData) {
    return await ProductESGProfile.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .populate('category', 'name type')
      .populate('emissionFactor', 'name code emissionValue unit co2Unit');
  }

  /**
   * Soft Delete Profile
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async softDelete(id) {
    return await ProductESGProfile.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );
  }
}

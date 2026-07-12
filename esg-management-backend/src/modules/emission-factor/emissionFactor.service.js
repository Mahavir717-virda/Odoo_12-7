import { EmissionFactorRepository } from './emissionFactor.repository.js';
import { CategoryRepository } from '../category/category.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const emissionFactorRepository = new EmissionFactorRepository();
const categoryRepository = new CategoryRepository();

export class EmissionFactorService {
  /**
   * Create an Emission Factor
   * @param {object} factorData 
   * @returns {Promise<object>}
   */
  async createEmissionFactor(factorData) {
    // 1. Verify code uniqueness
    const existingCode = await emissionFactorRepository.findByCode(factorData.code);
    if (existingCode) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Emission factor code '${factorData.code}' already exists`);
    }

    // 2. Validate category exists
    const category = await categoryRepository.findById(factorData.category);
    if (!category) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated category not found');
    }

    // 3. Validate dates: effectiveTo must be after effectiveFrom
    if (factorData.effectiveTo && new Date(factorData.effectiveTo) <= new Date(factorData.effectiveFrom)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'effectiveTo date must be after effectiveFrom date');
    }

    // 4. Validate unique default flag for same sourceType, unit, country, and region
    if (factorData.isDefault) {
      const existingDefault = await emissionFactorRepository.findDefaultFactor(
        factorData.sourceType,
        factorData.unit,
        factorData.country,
        factorData.region
      );
      if (existingDefault) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `A default emission factor already exists for sourceType '${factorData.sourceType}', unit '${factorData.unit}', country '${factorData.country}', and region '${factorData.region}'`
        );
      }
    }

    return await emissionFactorRepository.create(factorData);
  }

  /**
   * Get emission factors with paginated filters
   * @param {object} query 
   * @returns {Promise<object>}
   */
  async queryEmissionFactors(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'desc' ? 'desc' : 'asc';
    const search = query.search || '';

    return await emissionFactorRepository.findAll({
      page,
      limit,
      sortBy,
      order,
      search,
      category: query.category,
      sourceType: query.sourceType,
      status: query.status,
      country: query.country,
      region: query.region,
      unit: query.unit,
      effectiveDate: query.effectiveDate,
    });
  }

  /**
   * Find an Emission Factor by ID
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async getEmissionFactorById(id) {
    const factor = await emissionFactorRepository.findById(id);
    if (!factor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Emission factor not found');
    }
    return factor;
  }

  /**
   * Update Emission Factor details
   * @param {string} id 
   * @param {object} updateBody 
   * @returns {Promise<object>}
   */
  async updateEmissionFactor(id, updateBody) {
    const factor = await this.getEmissionFactorById(id);

    // 1. If updating code, check for uniqueness
    if (updateBody.code && updateBody.code.toUpperCase() !== factor.code.toUpperCase()) {
      const existingCode = await emissionFactorRepository.findByCode(updateBody.code);
      if (existingCode) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Emission factor code '${updateBody.code}' already exists`);
      }
    }

    // 2. If updating category, check if it exists
    if (updateBody.category) {
      const category = await categoryRepository.findById(updateBody.category);
      if (!category) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated category not found');
      }
    }

    // 3. If updating dates, validate chronological sequence
    const effectiveFrom = updateBody.effectiveFrom ? new Date(updateBody.effectiveFrom) : new Date(factor.effectiveFrom);
    const effectiveTo = updateBody.effectiveTo ? new Date(updateBody.effectiveTo) : (updateBody.effectiveTo === null ? null : (factor.effectiveTo ? new Date(factor.effectiveTo) : null));
    
    if (effectiveTo && effectiveTo <= effectiveFrom) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'effectiveTo date must be after effectiveFrom date');
    }

    // 4. If updating isDefault to true or changing sourceType/unit/country/region on a default factor
    const isDefault = updateBody.isDefault !== undefined ? updateBody.isDefault : factor.isDefault;
    const sourceType = updateBody.sourceType || factor.sourceType;
    const unit = updateBody.unit || factor.unit;
    const country = updateBody.country || factor.country;
    const region = updateBody.region || factor.region;

    if (isDefault) {
      const existingDefault = await emissionFactorRepository.findDefaultFactor(sourceType, unit, country, region);
      if (existingDefault && existingDefault._id.toString() !== id.toString()) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `A default emission factor already exists for sourceType '${sourceType}', unit '${unit}', country '${country}', and region '${region}'`
        );
      }
    }

    return await emissionFactorRepository.update(id, updateBody);
  }

  /**
   * Soft delete Emission Factor
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async deleteEmissionFactor(id) {
    await this.getEmissionFactorById(id);
    return await emissionFactorRepository.softDelete(id);
  }
}

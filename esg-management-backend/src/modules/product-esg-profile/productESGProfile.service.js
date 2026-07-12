import { ProductESGProfileRepository } from './productESGProfile.repository.js';
import { DepartmentRepository } from '../department/department.repository.js';
import { CategoryRepository } from '../category/category.repository.js';
import { EmissionFactorRepository } from '../emission-factor/emissionFactor.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const productESGProfileRepository = new ProductESGProfileRepository();
const departmentRepository = new DepartmentRepository();
const categoryRepository = new CategoryRepository();
const emissionFactorRepository = new EmissionFactorRepository();

export class ProductESGProfileService {
  /**
   * Create a Product ESG Profile
   * @param {object} profileData 
   * @returns {Promise<object>}
   */
  async createProfile(profileData) {
    // 1. Verify code uniqueness
    const existingCode = await productESGProfileRepository.findByCode(profileData.productCode);
    if (existingCode) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Product code '${profileData.productCode}' already exists`);
    }

    // 2. Validate references exist
    const [department, category, factor] = await Promise.all([
      departmentRepository.findById(profileData.department),
      categoryRepository.findById(profileData.category),
      emissionFactorRepository.findById(profileData.emissionFactor),
    ]);

    if (!department) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated department not found');
    if (!category) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated category not found');
    if (!factor) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated emission factor not found');

    return await productESGProfileRepository.create(profileData);
  }

  /**
   * Get profiles with paginated filters
   * @param {object} query 
   * @returns {Promise<object>}
   */
  async queryProfiles(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'desc' ? 'desc' : 'asc';
    const search = query.search || '';
    
    let carbonNeutral;
    if (query.carbonNeutral === 'true') carbonNeutral = true;
    if (query.carbonNeutral === 'false') carbonNeutral = false;

    return await productESGProfileRepository.findAll({
      page,
      limit,
      sortBy,
      order,
      search,
      department: query.department,
      category: query.category,
      materialType: query.materialType,
      productType: query.productType,
      status: query.status,
      countryOfOrigin: query.countryOfOrigin,
      manufacturer: query.manufacturer,
      supplier: query.supplier,
      carbonNeutral,
    });
  }

  /**
   * Find Profile by ID
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async getProfileById(id) {
    const profile = await productESGProfileRepository.findById(id);
    if (!profile) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product ESG Profile not found');
    }
    return profile;
  }

  /**
   * Update Profile details
   * @param {string} id 
   * @param {object} updateBody 
   * @returns {Promise<object>}
   */
  async updateProfile(id, updateBody) {
    const profile = await this.getProfileById(id);

    // 1. If updating productCode, verify uniqueness
    if (updateBody.productCode && updateBody.productCode.toUpperCase() !== profile.productCode.toUpperCase()) {
      const existingCode = await productESGProfileRepository.findByCode(updateBody.productCode);
      if (existingCode) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Product code '${updateBody.productCode}' already exists`);
      }
    }

    // 2. Validate references if updating them
    if (updateBody.department) {
      const department = await departmentRepository.findById(updateBody.department);
      if (!department) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated department not found');
    }
    if (updateBody.category) {
      const category = await categoryRepository.findById(updateBody.category);
      if (!category) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated category not found');
    }
    if (updateBody.emissionFactor) {
      const factor = await emissionFactorRepository.findById(updateBody.emissionFactor);
      if (!factor) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated emission factor not found');
    }

    // Handle isCarbonNeutral configuration reset rules
    if (updateBody.isCarbonNeutral === false) {
      updateBody.carbonNeutralCertificate = null;
    }

    return await productESGProfileRepository.update(id, updateBody);
  }

  /**
   * Soft delete Profile
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async deleteProfile(id) {
    await this.getProfileById(id);
    return await productESGProfileRepository.softDelete(id);
  }
}

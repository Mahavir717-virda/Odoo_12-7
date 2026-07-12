import { CategoryRepository } from './category.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const categoryRepository = new CategoryRepository();

export class CategoryService {
  /**
   * Create a Category
   * @param {object} categoryData 
   * @returns {Promise<object>}
   */
  async createCategory(categoryData) {
    // Validate unique name inside each type
    const existing = await categoryRepository.findByTypeAndName(categoryData.type, categoryData.name);
    if (existing) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Category with name '${categoryData.name}' already exists inside type '${categoryData.type}'`);
    }

    return await categoryRepository.create(categoryData);
  }

  /**
   * Get categories with paginated filters
   * @param {object} query 
   * @returns {Promise<object>}
   */
  async queryCategories(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const sortBy = query.sortBy || 'sortOrder';
    const order = query.order === 'desc' ? 'desc' : 'asc';
    const search = query.search || '';
    const status = query.status;
    const type = query.type;
    const startDate = query.startDate;
    const endDate = query.endDate;

    return await categoryRepository.findAll({
      page,
      limit,
      sortBy,
      order,
      search,
      status,
      type,
      startDate,
      endDate,
    });
  }

  /**
   * Find a Category by ID
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
    }
    return category;
  }

  /**
   * Update category
   * @param {string} id 
   * @param {object} updateBody 
   * @returns {Promise<object>}
   */
  async updateCategory(id, updateBody) {
    const category = await this.getCategoryById(id);

    // If updating name or type, ensure name + type uniqueness holds
    const newName = updateBody.name || category.name;
    const newType = updateBody.type || category.type;

    if (
      (updateBody.name && updateBody.name.toLowerCase() !== category.name.toLowerCase()) ||
      (updateBody.type && updateBody.type !== category.type)
    ) {
      const existing = await categoryRepository.findByTypeAndName(newType, newName);
      if (existing && existing._id.toString() !== id.toString()) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Category with name '${newName}' already exists inside type '${newType}'`);
      }
    }

    return await categoryRepository.update(id, updateBody);
  }

  /**
   * Soft delete category
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async deleteCategory(id) {
    await this.getCategoryById(id);
    return await categoryRepository.softDelete(id);
  }
}

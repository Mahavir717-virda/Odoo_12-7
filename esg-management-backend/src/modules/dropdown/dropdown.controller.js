import { Department } from '../department/department.model.js';
import { Category } from '../category/category.model.js';
import { EmissionFactor } from '../emission-factor/emissionFactor.model.js';
import { ProductESGProfile } from '../product-esg-profile/productESGProfile.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../utils/constants.js';

export class DropdownController {
  /**
   * Get departments formatted for dropdowns
   */
  getDepartments = asyncHandler(async (req, res) => {
    const list = await Department.find({ isDeleted: false, status: 'ACTIVE' }, { name: 1 })
      .sort({ name: 1 })
      .lean();

    const formatted = list.map((item) => ({
      id: item._id,
      name: item.name,
      label: item.name,
    }));

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, formatted, 'Departments dropdown retrieved successfully')
    );
  });

  /**
   * Get categories formatted for dropdowns
   */
  getCategories = asyncHandler(async (req, res) => {
    const list = await Category.find({ isDeleted: false, status: 'ACTIVE' }, { name: 1, type: 1 })
      .sort({ type: 1, name: 1 })
      .lean();

    const formatted = list.map((item) => ({
      id: item._id,
      name: item.name,
      label: `${item.name} (${item.type})`,
    }));

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, formatted, 'Categories dropdown retrieved successfully')
    );
  });

  /**
   * Get emission factors formatted for dropdowns
   */
  getEmissionFactors = asyncHandler(async (req, res) => {
    const list = await EmissionFactor.find({ isDeleted: false, status: 'ACTIVE' }, { name: 1, code: 1, unit: 1 })
      .sort({ name: 1 })
      .lean();

    const formatted = list.map((item) => ({
      id: item._id,
      name: item.name,
      label: `${item.name} [${item.code}] (${item.unit})`,
    }));

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, formatted, 'Emission factors dropdown retrieved successfully')
    );
  });

  /**
   * Get products formatted for dropdowns
   */
  getProducts = asyncHandler(async (req, res) => {
    const list = await ProductESGProfile.find({ isDeleted: false, status: 'ACTIVE' }, { productName: 1, productCode: 1 })
      .sort({ productName: 1 })
      .lean();

    const formatted = list.map((item) => ({
      id: item._id,
      name: item.productName,
      label: `${item.productName} (${item.productCode})`,
    }));

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, formatted, 'Products dropdown retrieved successfully')
    );
  });
}
export default DropdownController;

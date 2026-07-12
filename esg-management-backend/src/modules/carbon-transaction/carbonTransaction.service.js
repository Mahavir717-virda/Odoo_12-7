import { CarbonTransactionRepository } from './carbonTransaction.repository.js';
import { DepartmentRepository } from '../department/department.repository.js';
import { ProductESGProfileRepository } from '../product-esg-profile/productESGProfile.repository.js';
import { EmissionFactorRepository } from '../emission-factor/emissionFactor.repository.js';
import { calculateEmission } from './carbonCalculator.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import { CALCULATION_METHOD, APPROVAL_STATUS } from './carbonTransaction.constants.js';

const carbonTransactionRepository = new CarbonTransactionRepository();
const departmentRepository = new DepartmentRepository();
const productESGProfileRepository = new ProductESGProfileRepository();
const emissionFactorRepository = new EmissionFactorRepository();

export class CarbonTransactionService {
  /**
   * Auto-generate sequential transaction numbers (e.g., CT-000001)
   * @returns {Promise<string>}
   */
  async generateTransactionNumber() {
    const latestTx = await carbonTransactionRepository.findLatestTransaction();
    if (!latestTx || !latestTx.transactionNumber) {
      return 'CT-000001';
    }

    const numericPart = latestTx.transactionNumber.replace('CT-', '');
    const nextNumber = parseInt(numericPart, 10) + 1;
    return `CT-${nextNumber.toString().padStart(6, '0')}`;
  }

  /**
   * Create new carbon transaction record
   * @param {object} txData 
   * @returns {Promise<object>}
   */
  async createTransaction(txData) {
    // 1. Validate date sequence (cannot be in the future)
    const transactionDate = txData.transactionDate ? new Date(txData.transactionDate) : new Date();
    if (transactionDate > new Date()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Transaction date cannot be in the future');
    }

    // 2. Validate references
    const [department, product] = await Promise.all([
      departmentRepository.findById(txData.department),
      productESGProfileRepository.findById(txData.productESGProfile),
    ]);

    if (!department) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated department not found');
    if (!product) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated Product ESG Profile not found');

    // Fetch the correct emission factor linked to the product profile
    const emissionFactorId = product.emissionFactor._id || product.emissionFactor;
    const factor = await emissionFactorRepository.findById(emissionFactorId);
    if (!factor) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated Emission Factor not found');

    // 3. Determine emission factor value snapshot & calculated emission
    let emissionFactorValue = txData.emissionFactorValue;
    let calculatedEmission = txData.calculatedEmission;
    const calculationMethod = txData.calculationMethod || CALCULATION_METHOD.AUTO;

    if (calculationMethod === CALCULATION_METHOD.AUTO) {
      // Auto calculation: Use factor's current value
      emissionFactorValue = factor.emissionValue;
      calculatedEmission = calculateEmission(txData.quantity, emissionFactorValue);
    } else {
      // Manual calculation: Verify required manual parameters are provided
      if (emissionFactorValue === undefined || emissionFactorValue === null || emissionFactorValue <= 0) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'emissionFactorValue is required and must be greater than zero for manual calculations');
      }
      if (calculatedEmission === undefined || calculatedEmission === null || calculatedEmission < 0) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'calculatedEmission is required and must be positive for manual calculations');
      }
    }

    // 4. Generate transaction number & build final object
    const transactionNumber = await this.generateTransactionNumber();

    const finalTxData = {
      ...txData,
      transactionNumber,
      transactionDate,
      emissionFactor: factor._id,
      emissionFactorValue,
      calculatedEmission,
      co2Unit: factor.co2Unit,
      isAutoCalculated: calculationMethod === CALCULATION_METHOD.AUTO,
    };

    return await carbonTransactionRepository.create(finalTxData);
  }

  /**
   * List carbon transactions with paginated search/filters
   * @param {object} query 
   * @returns {Promise<object>}
   */
  async queryTransactions(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const sortBy = query.sortBy || 'transactionDate';
    const order = query.order === 'desc' ? 'desc' : 'asc';
    const search = query.search || '';

    return await carbonTransactionRepository.findAll({
      page,
      limit,
      sortBy,
      order,
      search,
      department: query.department,
      activityType: query.activityType,
      status: query.status,
      approvalStatus: query.approvalStatus,
      startDate: query.startDate,
      endDate: query.endDate,
      product: query.product,
    });
  }

  /**
   * Find carbon transaction by ID
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async getTransactionById(id) {
    const tx = await carbonTransactionRepository.findById(id);
    if (!tx) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carbon transaction not found');
    }
    return tx;
  }

  /**
   * Update transaction details
   * @param {string} id 
   * @param {object} updateBody 
   * @returns {Promise<object>}
   */
  async updateTransaction(id, updateBody) {
    const tx = await this.getTransactionById(id);

    // Block changes to core identification fields
    if (updateBody.transactionNumber) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Transaction number cannot be modified');
    }

    // Validate dates if updated
    if (updateBody.transactionDate) {
      const transactionDate = new Date(updateBody.transactionDate);
      if (transactionDate > new Date()) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Transaction date cannot be in the future');
      }
    }

    // Validate references if updated
    if (updateBody.department) {
      const department = await departmentRepository.findById(updateBody.department);
      if (!department) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated department not found');
    }
    if (updateBody.productESGProfile) {
      const product = await productESGProfileRepository.findById(updateBody.productESGProfile);
      if (!product) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated Product ESG Profile not found');
    }

    // Handle recalculation requirements if quantity, factor, or method changes
    const quantity = updateBody.quantity !== undefined ? updateBody.quantity : tx.quantity;
    const calculationMethod = updateBody.calculationMethod || tx.calculationMethod;
    let emissionFactorValue = updateBody.emissionFactorValue !== undefined ? updateBody.emissionFactorValue : tx.emissionFactorValue;
    let calculatedEmission = updateBody.calculatedEmission !== undefined ? updateBody.calculatedEmission : tx.calculatedEmission;

    if (calculationMethod === CALCULATION_METHOD.AUTO) {
      const factorId = updateBody.emissionFactor || tx.emissionFactor._id || tx.emissionFactor;
      const factor = await emissionFactorRepository.findById(factorId);
      if (!factor) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Associated Emission Factor not found');

      emissionFactorValue = factor.emissionValue;
      calculatedEmission = calculateEmission(quantity, emissionFactorValue);
      updateBody.isAutoCalculated = true;
    } else {
      if (calculationMethod !== tx.calculationMethod) {
        updateBody.isAutoCalculated = false;
      }
    }

    updateBody.emissionFactorValue = emissionFactorValue;
    updateBody.calculatedEmission = calculatedEmission;

    // Handle approval details setup
    if (updateBody.approvalStatus && updateBody.approvalStatus !== tx.approvalStatus) {
      if (updateBody.approvalStatus === APPROVAL_STATUS.APPROVED || updateBody.approvalStatus === APPROVAL_STATUS.REJECTED) {
        updateBody.approvedAt = new Date();
      } else {
        updateBody.approvedAt = null;
        updateBody.approvedBy = null;
      }
    }

    return await carbonTransactionRepository.update(id, updateBody);
  }

  /**
   * Soft delete carbon transaction
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async deleteTransaction(id) {
    await this.getTransactionById(id);
    return await carbonTransactionRepository.softDelete(id);
  }

  /**
   * Get overall stats overview
   * @param {object} query 
   * @returns {Promise<object>}
   */
  async getStatistics(query = {}) {
    const filters = {};
    if (query.department) filters.department = new mongoose.Types.ObjectId(query.department);
    if (query.activityType) filters.activityType = query.activityType;
    if (query.approvalStatus) filters.approvalStatus = query.approvalStatus;

    if (query.startDate || query.endDate) {
      filters.transactionDate = {};
      if (query.startDate) filters.transactionDate.$gte = new Date(query.startDate);
      if (query.endDate) filters.transactionDate.$lte = new Date(query.endDate);
    }

    return await carbonTransactionRepository.getStatistics(filters);
  }

  /**
   * Fetch dashboard grouping analytics
   * @param {object} query 
   * @returns {Promise<object>}
   */
  async getDashboardAggregation(query = {}) {
    const filters = {};
    if (query.department) filters.department = new mongoose.Types.ObjectId(query.department);
    if (query.activityType) filters.activityType = query.activityType;

    if (query.startDate || query.endDate) {
      filters.transactionDate = {};
      if (query.startDate) filters.transactionDate.$gte = new Date(query.startDate);
      if (query.endDate) filters.transactionDate.$lte = new Date(query.endDate);
    }

    return await carbonTransactionRepository.getDashboardAggregation(filters);
  }
}
export default CarbonTransactionService;

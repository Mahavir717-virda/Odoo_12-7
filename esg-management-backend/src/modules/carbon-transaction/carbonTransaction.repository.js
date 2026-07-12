import mongoose from 'mongoose';
import { CarbonTransaction } from './carbonTransaction.model.js';

export class CarbonTransactionRepository {
  /**
   * Create new carbon transaction
   * @param {object} txData 
   * @returns {Promise<object>}
   */
  async create(txData) {
    return await CarbonTransaction.create(txData);
  }

  /**
   * Find a transaction by transactionNumber
   * @param {string} transactionNumber 
   * @returns {Promise<object|null>}
   */
  async findByTransactionNumber(transactionNumber) {
    return await CarbonTransaction.findOne({ transactionNumber: transactionNumber.toUpperCase(), isDeleted: false }).lean();
  }

  /**
   * Get latest transaction for auto-number generation
   * @returns {Promise<object|null>}
   */
  async findLatestTransaction() {
    return await CarbonTransaction.findOne({}, { transactionNumber: 1 }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Find carbon transaction by ID
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return await CarbonTransaction.findOne({ _id: id, isDeleted: false })
      .populate('department', 'name code')
      .populate('productESGProfile', 'productName productCode')
      .populate('emissionFactor', 'name code emissionValue')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();
  }

  /**
   * Find all carbon transactions with page limits, projections, searches and filters
   * @param {object} options 
   * @returns {Promise<object>}
   */
  async findAll({ page = 1, limit = 10, sortBy = 'transactionDate', order = 'desc', search = '', department, activityType, status, approvalStatus, startDate, endDate, product }) {
    const query = { isDeleted: false };

    // Search query mapping
    if (search) {
      query.$or = [
        { transactionNumber: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } },
      ];
    }

    // Direct filters
    if (department) query.department = department;
    if (activityType) query.activityType = activityType;
    if (status) query.status = status;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (product) query.productESGProfile = product;

    // Date range filter
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) {
        query.transactionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.transactionDate.$lte = new Date(endDate);
      }
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const projection = {
      transactionNumber: 1,
      department: 1,
      productESGProfile: 1,
      emissionFactor: 1,
      activityType: 1,
      activityReference: 1,
      quantity: 1,
      unit: 1,
      emissionFactorValue: 1,
      calculatedEmission: 1,
      co2Unit: 1,
      calculationMethod: 1,
      transactionDate: 1,
      approvalStatus: 1,
      status: 1,
      createdAt: 1,
    };

    const [results, totalRecords] = await Promise.all([
      CarbonTransaction.find(query, projection)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('department', 'name code')
        .populate('productESGProfile', 'productName productCode')
        .populate('emissionFactor', 'name code emissionValue')
        .lean(),
      CarbonTransaction.countDocuments(query),
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
   * Update transaction details
   * @param {string} id 
   * @param {object} updateData 
   * @returns {Promise<object|null>}
   */
  async update(id, updateData) {
    return await CarbonTransaction.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .populate('productESGProfile', 'productName productCode')
      .populate('emissionFactor', 'name code emissionValue')
      .lean();
  }

  /**
   * Soft Delete carbon transaction
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async softDelete(id) {
    return await CarbonTransaction.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    ).lean();
  }

  /**
   * Get basic statistics (average, max, min, highest, lowest)
   * @param {object} filters 
   * @returns {Promise<object>}
   */
  async getStatistics(filters = {}) {
    const query = { isDeleted: false, ...filters };

    const stats = await CarbonTransaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalEmissions: { $sum: '$calculatedEmission' },
          averageEmission: { $avg: '$calculatedEmission' },
          highestEmission: { $max: '$calculatedEmission' },
          lowestEmission: { $min: '$calculatedEmission' },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    if (!stats || stats.length === 0) {
      return {
        totalEmissions: 0,
        averageEmission: 0,
        highestEmission: 0,
        lowestEmission: 0,
        totalRecords: 0,
      };
    }

    const result = stats[0];
    delete result._id;
    // Format values to 4 decimal places
    return {
      totalEmissions: Number(result.totalEmissions.toFixed(4)),
      averageEmission: Number(result.averageEmission.toFixed(4)),
      highestEmission: Number(result.highestEmission.toFixed(4)),
      lowestEmission: Number(result.lowestEmission.toFixed(4)),
      totalRecords: result.totalRecords,
    };
  }

  /**
   * Get dashboard data aggregated by multiple facets
   * @param {object} filters 
   * @returns {Promise<object>}
   */
  async getDashboardAggregation(filters = {}) {
    const query = { isDeleted: false, ...filters };

    // Get Today boundaries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      byDepartment,
      byProduct,
      byActivityType,
      byMonthYear,
      totalDepartmentsCount,
      totalCategoriesCount,
      totalProductsCount,
      totalTransactionsCount,
      todayEmissionsData,
      topProductsData,
      recentTransactionsData
    ] = await Promise.all([
      // 1. Group by Department
      CarbonTransaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$department',
            totalEmissions: { $sum: '$calculatedEmission' },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'departmentDetails',
          },
        },
        { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            departmentName: { $ifNull: ['$departmentDetails.name', 'Unknown'] },
            departmentCode: { $ifNull: ['$departmentDetails.code', ''] },
            totalEmissions: { $round: ['$totalEmissions', 4] },
            count: 1,
          },
        },
      ]),

      // 2. Group by Product
      CarbonTransaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$productESGProfile',
            totalEmissions: { $sum: '$calculatedEmission' },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'productesgprofiles',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            productName: { $ifNull: ['$productDetails.productName', 'Unknown'] },
            productCode: { $ifNull: ['$productDetails.productCode', ''] },
            totalEmissions: { $round: ['$totalEmissions', 4] },
            count: 1,
          },
        },
      ]),

      // 3. Group by Activity Type
      CarbonTransaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$activityType',
            totalEmissions: { $sum: '$calculatedEmission' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            activityType: '$_id',
            totalEmissions: { $round: ['$totalEmissions', 4] },
            count: 1,
          },
        },
      ]),

      // 4. Group by Month and Year
      CarbonTransaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: '$transactionDate' },
              month: { $month: '$transactionDate' },
            },
            totalEmissions: { $sum: '$calculatedEmission' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
          $project: {
            year: '$_id.year',
            month: '$_id.month',
            totalEmissions: { $round: ['$totalEmissions', 4] },
            count: 1,
          },
        },
      ]),

      // 5. Total Departments Count
      mongoose.model('Department').countDocuments({ isDeleted: false }),

      // 6. Total Categories Count
      mongoose.model('Category').countDocuments({ isDeleted: false }),

      // 7. Total Products Count
      mongoose.model('ProductESGProfile').countDocuments({ isDeleted: false }),

      // 8. Total Carbon Transactions Count
      CarbonTransaction.countDocuments({ isDeleted: false }),

      // 9. Today's Emissions
      CarbonTransaction.aggregate([
        {
          $match: {
            isDeleted: false,
            transactionDate: { $gte: todayStart, $lte: todayEnd }
          }
        },
        {
          $group: {
            _id: null,
            todayEmissions: { $sum: '$calculatedEmission' }
          }
        }
      ]),

      // 10. Top 10 Carbon Producing Products
      CarbonTransaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$productESGProfile',
            totalEmissions: { $sum: '$calculatedEmission' }
          }
        },
        { $sort: { totalEmissions: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'productesgprofiles',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            productName: { $ifNull: ['$productDetails.productName', 'Unknown'] },
            productCode: { $ifNull: ['$productDetails.productCode', ''] },
            totalEmissions: { $round: ['$totalEmissions', 4] }
          }
        }
      ]),

      // 11. Recent Carbon Transactions (Limit 5)
      CarbonTransaction.find({ isDeleted: false })
        .sort({ transactionDate: -1 })
        .limit(5)
        .populate('department', 'name code')
        .populate('productESGProfile', 'productName productCode')
        .lean()
    ]);

    const todayEmissions = todayEmissionsData.length > 0 ? Number(todayEmissionsData[0].todayEmissions.toFixed(4)) : 0;

    return {
      totals: {
        departments: totalDepartmentsCount,
        categories: totalCategoriesCount,
        products: totalProductsCount,
        transactions: totalTransactionsCount,
        todayEmissions
      },
      byDepartment,
      byProduct,
      byActivityType,
      byMonthYear,
      topProducts: topProductsData,
      recentTransactions: recentTransactionsData
    };
  }
}

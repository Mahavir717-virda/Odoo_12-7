import { Policy } from './policy.model.js';
import { PolicyAcknowledgement } from './policyAcknowledgement.model.js';
import mongoose from 'mongoose';

export class PolicyRepository {
  async create(policyData) {
    return await Policy.create(policyData);
  }

  async findById(id) {
    return await Policy.findById(id).populate('createdBy', 'name email');
  }

  async findByNumber(policyNumber) {
    return await Policy.findOne({ policyNumber: policyNumber.trim() });
  }

  async findAll({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', status, category, department }) {
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (department && department !== 'All') {
      query.$or = [{ department }, { department: 'All' }];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const [results, totalCount] = await Promise.all([
      Policy.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Policy.countDocuments(query),
    ]);

    return {
      results,
      totalCount,
      limit,
      page,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async update(id, updateData) {
    return await Policy.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  }

  async saveAcknowledgement(employeeId, policyId) {
    return await PolicyAcknowledgement.findOneAndUpdate(
      { employeeId, policyId },
      { $set: { acknowledged: true, acknowledgedAt: new Date() } },
      { new: true, upsert: true }
    );
  }

  async getAcknowledgement(employeeId, policyId) {
    return await PolicyAcknowledgement.findOne({ employeeId, policyId });
  }

  async getReportsSummary() {
    const totalPolicies = await Policy.countDocuments({});
    const publishedCount = await Policy.countDocuments({ status: 'Published' });
    const draftCount = await Policy.countDocuments({ status: 'Draft' });
    const totalAcknowledgements = await PolicyAcknowledgement.countDocuments({ acknowledged: true });

    // Aggregate average acknowledgements per policy
    const policyAcknowledgementStats = await PolicyAcknowledgement.aggregate([
      { $match: { acknowledged: true } },
      { $group: { _id: '$policyId', count: { $sum: 1 } } }
    ]);

    return {
      totalPolicies,
      publishedCount,
      draftCount,
      totalAcknowledgements,
      policyAcknowledgementStats,
    };
  }
}

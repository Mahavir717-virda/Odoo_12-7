import { Compliance } from './compliance.model.js';
import { ComplianceUpdate } from './complianceUpdate.model.js';
import { ComplianceHistory } from './complianceHistory.model.js';
import mongoose from 'mongoose';

export class ComplianceRepository {
  async create(complianceData) {
    return await Compliance.create(complianceData);
  }

  async findById(id) {
    return await Compliance.findById(id)
      .populate('auditId', 'name type department')
      .populate('policyId', 'title policyNumber category')
      .populate('assignedTo', 'name email')
      .populate('reportedBy', 'name email')
      .populate('verifiedBy', 'name email');
  }

  async findAll({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', status, severity, assignedTo, department }) {
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (assignedTo) query.assignedTo = assignedTo;
    if (department) query.department = department;

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const [results, totalCount] = await Promise.all([
      Compliance.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'name email')
        .populate('reportedBy', 'name email'),
      Compliance.countDocuments(query),
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
    return await Compliance.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate('assignedTo', 'name email')
      .populate('reportedBy', 'name email');
  }

  async createUpdate(updateData) {
    return await ComplianceUpdate.create(updateData);
  }

  async findUpdatesByComplianceId(complianceId) {
    return await ComplianceUpdate.find({ complianceId }).populate('employeeId', 'name email');
  }

  async createHistory(historyData) {
    return await ComplianceHistory.create(historyData);
  }

  async findHistoryByComplianceId(complianceId) {
    return await ComplianceHistory.find({ complianceId }).populate('changedBy', 'name email').sort({ createdAt: 1 });
  }

  async getReportsSummary() {
    const totalIssues = await Compliance.countDocuments({});
    const openCount = await Compliance.countDocuments({ status: 'Open' });
    const inProgressCount = await Compliance.countDocuments({ status: 'In Progress' });
    const resolvedCount = await Compliance.countDocuments({ status: 'Resolved' });
    const closedCount = await Compliance.countDocuments({ status: 'Closed' });
    const highSeverityCount = await Compliance.countDocuments({ severity: 'High', status: { $ne: 'Closed' } });

    const now = new Date();
    const overdueCount = await Compliance.countDocuments({
      status: { $ne: 'Closed' },
      dueDate: { $lt: now },
    });

    // Grouping by department
    const deptWiseSummary = await Compliance.aggregate([
      { $group: { _id: '$department', total: { $sum: 1 }, closed: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } } } }
    ]);

    return {
      totalIssues,
      openCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      highSeverityCount,
      overdueCount,
      deptWiseSummary,
    };
  }
}

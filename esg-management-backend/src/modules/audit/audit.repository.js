import { Audit } from './audit.model.js';
import { AuditFinding } from './auditFinding.model.js';
import { CorrectiveAction } from './correctiveAction.model.js';
import mongoose from 'mongoose';

export class AuditRepository {
  async create(auditData) {
    return await Audit.create(auditData);
  }

  async findById(id) {
    return await Audit.findById(id)
      .populate('auditor', 'name email')
      .populate('createdBy', 'name email');
  }

  async findAll({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', status, type, department }) {
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (department) query.department = department;

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const [results, totalCount] = await Promise.all([
      Audit.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('auditor', 'name email'),
      Audit.countDocuments(query),
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
    return await Audit.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  }

  async createFinding(findingData) {
    return await AuditFinding.create(findingData);
  }

  async findFindingById(id) {
    return await AuditFinding.findById(id).populate('auditId', 'name type department');
  }

  async findFindingsByAuditId(auditId) {
    return await AuditFinding.find({ auditId });
  }

  async updateFindingStatus(id, status) {
    return await AuditFinding.findByIdAndUpdate(id, { $set: { status } }, { new: true });
  }

  async createCorrectiveAction(actionData) {
    return await CorrectiveAction.create(actionData);
  }

  async findCorrectiveActionById(id) {
    return await CorrectiveAction.findById(id)
      .populate('assignedTo', 'name email')
      .populate({
        path: 'findingId',
        populate: { path: 'auditId', select: 'name type department' }
      });
  }

  async findCorrectiveActionsByFinding(findingId) {
    return await CorrectiveAction.find({ findingId }).populate('assignedTo', 'name email');
  }

  async updateCorrectiveAction(id, updateData) {
    return await CorrectiveAction.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  }

  async getReportsSummary() {
    const totalAudits = await Audit.countDocuments({});
    const completedAudits = await Audit.countDocuments({ status: 'Completed' });
    const pendingAudits = await Audit.countDocuments({ status: 'Scheduled' });
    const openFindings = await AuditFinding.countDocuments({ status: { $ne: 'Closed' } });
    const highSeverityIssues = await AuditFinding.countDocuments({ severity: 'High', status: { $ne: 'Closed' } });

    // Compliance percentage = (closed findings / total findings) * 100
    const totalFindings = await AuditFinding.countDocuments({});
    const closedFindings = await AuditFinding.countDocuments({ status: 'Closed' });
    const compliancePercentage = totalFindings > 0 ? Math.round((closedFindings / totalFindings) * 100) : 100;

    return {
      totalAudits,
      completedAudits,
      pendingAudits,
      openFindings,
      highSeverityIssues,
      compliancePercentage,
    };
  }
}

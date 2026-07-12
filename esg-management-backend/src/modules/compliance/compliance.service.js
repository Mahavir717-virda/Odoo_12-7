import { ComplianceRepository } from './compliance.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import { COMPLIANCE_STATUS } from './compliance.constants.js';

const complianceRepository = new ComplianceRepository();

export class ComplianceService {
  async createIssue(complianceData) {
    const issue = await complianceRepository.create(complianceData);
    
    // Create initial history record
    await complianceRepository.createHistory({
      complianceId: issue._id,
      status: COMPLIANCE_STATUS.OPEN,
      changedBy: complianceData.reportedBy,
      remarks: 'Compliance issue opened',
    });

    return issue;
  }

  async getIssueById(id) {
    const issue = await complianceRepository.findById(id);
    if (!issue) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Compliance issue not found');
    }
    return issue;
  }

  async listIssues(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'asc' ? 'asc' : 'desc';
    const status = query.status;
    const severity = query.severity;
    const assignedTo = query.assignedTo;
    const department = query.department;

    return await complianceRepository.findAll({
      page,
      limit,
      sortBy,
      order,
      status,
      severity,
      assignedTo,
      department,
    });
  }

  async assignIssue(id, employeeId, adminId) {
    const issue = await this.getIssueById(id);
    if (issue.status === COMPLIANCE_STATUS.CLOSED) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot assign a closed compliance issue');
    }

    const updatedIssue = await complianceRepository.update(id, {
      assignedTo: employeeId,
      status: COMPLIANCE_STATUS.IN_PROGRESS,
    });

    // Save history log
    await complianceRepository.createHistory({
      complianceId: id,
      status: COMPLIANCE_STATUS.IN_PROGRESS,
      changedBy: adminId,
      remarks: `Issue assigned to user: ${employeeId}`,
    });

    return updatedIssue;
  }

  async addProgressUpdate(id, employeeId, progressData) {
    const issue = await this.getIssueById(id);
    if (issue.status === COMPLIANCE_STATUS.CLOSED) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot update a closed compliance issue');
    }

    // Save progress update
    const update = await complianceRepository.createUpdate({
      complianceId: id,
      employeeId,
      progress: progressData.progress,
      remarks: progressData.remarks,
      attachment: progressData.attachment,
      status: progressData.progress === 100 ? COMPLIANCE_STATUS.RESOLVED : COMPLIANCE_STATUS.IN_PROGRESS,
    });

    let newStatus = issue.status;
    if (progressData.progress === 100) {
      newStatus = COMPLIANCE_STATUS.RESOLVED;
    } else if (issue.status === COMPLIANCE_STATUS.OPEN) {
      newStatus = COMPLIANCE_STATUS.IN_PROGRESS;
    }

    if (newStatus !== issue.status) {
      await complianceRepository.update(id, { status: newStatus });
      
      // Save history log
      await complianceRepository.createHistory({
        complianceId: id,
        status: newStatus,
        changedBy: employeeId,
        remarks: progressData.remarks || `Progress updated to ${progressData.progress}%`,
      });
    }

    return update;
  }

  async verifyIssueResolution(id, adminId, status, remarks) {
    const issue = await this.getIssueById(id);
    if (issue.status !== COMPLIANCE_STATUS.RESOLVED) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Can only verify issues that have been marked Resolved');
    }

    if (status === COMPLIANCE_STATUS.CLOSED) {
      const updated = await complianceRepository.update(id, {
        status: COMPLIANCE_STATUS.CLOSED,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      });

      // Save history log
      await complianceRepository.createHistory({
        complianceId: id,
        status: COMPLIANCE_STATUS.CLOSED,
        changedBy: adminId,
        remarks: remarks || 'Resolution verified and issue closed',
      });

      return updated;
    } else {
      // Revert status to In Progress
      const updated = await complianceRepository.update(id, {
        status: COMPLIANCE_STATUS.IN_PROGRESS,
      });

      // Save history log
      await complianceRepository.createHistory({
        complianceId: id,
        status: COMPLIANCE_STATUS.IN_PROGRESS,
        changedBy: adminId,
        remarks: remarks || 'Resolution rejected. Reverted back to In Progress',
      });

      return updated;
    }
  }

  async getReports() {
    return await complianceRepository.getReportsSummary();
  }

  async getHistory(complianceId) {
    await this.getIssueById(complianceId);
    return await complianceRepository.findHistoryByComplianceId(complianceId);
  }
}

import { AuditRepository } from './audit.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import { CORRECTIVE_ACTION_STATUS, FINDING_STATUS, AUDIT_STATUS } from './audit.constants.js';

const auditRepository = new AuditRepository();

export class AuditService {
  async scheduleAudit(auditData) {
    if (new Date(auditData.scheduledDate) > new Date(auditData.dueDate)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Scheduled date cannot be after due date');
    }
    return await auditRepository.create(auditData);
  }

  async getAuditById(id) {
    const audit = await auditRepository.findById(id);
    if (!audit) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Audit not found');
    }
    return audit;
  }

  async listAudits(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'asc' ? 'asc' : 'desc';
    const status = query.status;
    const type = query.type;
    const department = query.department;

    return await auditRepository.findAll({
      page,
      limit,
      sortBy,
      order,
      status,
      type,
      department,
    });
  }

  async updateAuditStatus(id, status) {
    await this.getAuditById(id);
    return await auditRepository.update(id, { status });
  }

  async addFinding(findingData) {
    await this.getAuditById(findingData.auditId);
    return await auditRepository.createFinding(findingData);
  }

  async getFindings(auditId) {
    await this.getAuditById(auditId);
    return await auditRepository.findFindingsByAuditId(auditId);
  }

  async assignCorrectiveAction(actionData) {
    const finding = await auditRepository.findFindingById(actionData.findingId);
    if (!finding) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Audit finding not found');
    }

    if (finding.status === FINDING_STATUS.CLOSED) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot assign corrective actions to a closed finding');
    }

    const correctiveAction = await auditRepository.createCorrectiveAction(actionData);

    // Update finding status to In Progress
    await auditRepository.updateFindingStatus(actionData.findingId, FINDING_STATUS.IN_PROGRESS);

    // Update audit status to In Progress
    await auditRepository.update(finding.auditId._id, { status: AUDIT_STATUS.IN_PROGRESS });

    return correctiveAction;
  }

  async resolveCorrectiveAction(actionId) {
    const action = await auditRepository.findCorrectiveActionById(actionId);
    if (!action) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Corrective action not found');
    }

    if (action.status !== CORRECTIVE_ACTION_STATUS.PENDING) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Action is already in ${action.status} state`);
    }

    return await auditRepository.updateCorrectiveAction(actionId, {
      status: CORRECTIVE_ACTION_STATUS.RESOLVED,
      completedAt: new Date(),
    });
  }

  async verifyCorrectiveAction(actionId, status, remarks) {
    const action = await auditRepository.findCorrectiveActionById(actionId);
    if (!action) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Corrective action not found');
    }

    if (action.status !== CORRECTIVE_ACTION_STATUS.RESOLVED) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Can only verify corrective actions that are Resolved');
    }

    if (status === CORRECTIVE_ACTION_STATUS.VERIFIED) {
      // Mark action as verified
      await auditRepository.updateCorrectiveAction(actionId, { status });

      // Check if all corrective actions for this finding are verified
      const allActions = await auditRepository.findCorrectiveActionsByFinding(action.findingId._id);
      const allVerified = allActions.every(act => act.status === CORRECTIVE_ACTION_STATUS.VERIFIED);

      if (allVerified) {
        // Auto resolve and close the finding
        await auditRepository.updateFindingStatus(action.findingId._id, FINDING_STATUS.CLOSED);

        // Check if all findings for this audit are closed
        const auditFindings = await auditRepository.findFindingsByAuditId(action.findingId.auditId._id);
        const allClosed = auditFindings.every(f => f.status === FINDING_STATUS.CLOSED);

        if (allClosed) {
          // Auto close the audit
          await auditRepository.update(action.findingId.auditId._id, { status: AUDIT_STATUS.CLOSED });
        }
      }
    } else {
      // Rejected - send back to pending for resolution
      await auditRepository.updateCorrectiveAction(actionId, { status: CORRECTIVE_ACTION_STATUS.PENDING });
    }

    return await auditRepository.findCorrectiveActionById(actionId);
  }

  async getReports() {
    return await auditRepository.getReportsSummary();
  }
}

import { ParticipationRepository } from './participation.repository.js';
import { CSRService } from '../csr/csr.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import { PARTICIPATION_STATUS } from './participation.constants.js';

const participationRepository = new ParticipationRepository();
const csrService = new CSRService();

export class ParticipationService {
  /**
   * Register employee participation for a CSR activity
   * @param {string} userId 
   * @param {string} activityId 
   * @param {string|null} proof 
   * @returns {Promise<object>}
   */
  async joinActivity(userId, activityId, proof = null) {
    // 1. Verify activity exists and is active
    const activity = await csrService.getCSRById(activityId);
    if (activity.status !== 'ACTIVE') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This CSR activity is inactive');
    }

    // 2. Check if user already joined
    const existing = await participationRepository.findByEmployeeAndActivity(userId, activityId);
    if (existing) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You have already registered for this activity');
    }

    // 3. Set points and status based on evidence requirements
    let status = PARTICIPATION_STATUS.PENDING;
    let points = 0;

    if (activity.evidenceRequired) {
      if (!proof) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Evidence/Proof is required for this CSR activity');
      }
    } else {
      // Open activity, auto approve and award points
      status = PARTICIPATION_STATUS.APPROVED;
      points = activity.points;
    }

    return await participationRepository.create({
      employee: userId,
      activity: activityId,
      proof,
      points,
      status,
    });
  }

  /**
   * Approve a pending employee participation (Admin only)
   * @param {string} participationId 
   * @param {string} adminId 
   * @returns {Promise<object>}
   */
  async approveParticipation(participationId, adminId) {
    const participation = await participationRepository.findById(participationId);
    if (!participation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Participation record not found');
    }

    if (participation.status !== PARTICIPATION_STATUS.PENDING) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Cannot approve a request that is already ${participation.status}`);
    }

    const updated = await participationRepository.update(participationId, {
      status: PARTICIPATION_STATUS.APPROVED,
      points: participation.activity.points,
      approvedBy: adminId,
    });

    // Notify employee
    try {
      const { NotificationService } = await import('../notification/notification.service.js');
      const notificationService = new NotificationService();
      await notificationService.createNotification({
        userId: participation.employee,
        title: 'CSR Participation Approved',
        message: `Your participation in "${participation.activity?.title || 'CSR Activity'}" has been approved. ${participation.activity?.points || 0} Points Awarded.`,
        module: 'Social',
        referenceId: participation._id,
        priority: 'Normal',
        type: 'INFO'
      });
    } catch (err) {
      console.error('Failed to trigger CSR participation approval notification:', err.message);
    }

    return updated;
  }

  /**
   * Reject a pending employee participation (Admin only)
   * @param {string} participationId 
   * @param {string} adminId 
   * @param {string} reason 
   * @returns {Promise<object>}
   */
  async rejectParticipation(participationId, adminId, reason) {
    if (!reason || !reason.trim()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Rejection reason is required');
    }

    const participation = await participationRepository.findById(participationId);
    if (!participation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Participation record not found');
    }

    if (participation.status !== PARTICIPATION_STATUS.PENDING) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Cannot reject a request that is already ${participation.status}`);
    }

    const updated = await participationRepository.update(participationId, {
      status: PARTICIPATION_STATUS.REJECTED,
      rejectionReason: reason,
      approvedBy: adminId,
    });

    // Notify employee
    try {
      const { NotificationService } = await import('../notification/notification.service.js');
      const notificationService = new NotificationService();
      await notificationService.createNotification({
        userId: participation.employee,
        title: 'CSR Participation Rejected',
        message: `Your participation in "${participation.activity?.title || 'CSR Activity'}" was rejected. Reason: ${reason}`,
        module: 'Social',
        referenceId: participation._id,
        priority: 'Normal',
        type: 'INFO'
      });
    } catch (err) {
      console.error('Failed to trigger CSR participation rejection notification:', err.message);
    }

    return updated;
  }

  /**
   * Query participations with filtering & pagination
   * @param {object} query 
   * @returns {Promise<object>}
   */
  async queryParticipations(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'asc' ? 'asc' : 'desc';
    const employee = query.employee;
    const activity = query.activity;
    const status = query.status;

    return await participationRepository.findAll({
      page,
      limit,
      sortBy,
      order,
      employee,
      activity,
      status,
    });
  }

  /**
   * Get participation by ID
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async getParticipationById(id) {
    const participation = await participationRepository.findById(id);
    if (!participation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Participation record not found');
    }
    return participation;
  }
}

import { CSRRepository } from './csr.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const csrRepository = new CSRRepository();

export class CSRService {
  /**
   * Create a CSR activity
   * @param {object} csrData 
   * @returns {Promise<object>}
   */
  async createCSR(csrData) {
    const existing = await csrRepository.findByTitle(csrData.title);
    if (existing) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'CSR activity with this title already exists');
    }
    return await csrRepository.create(csrData);
  }

  /**
   * Query CSR activities with filtering & pagination
   * @param {object} query 
   * @returns {Promise<object>}
   */
  async queryCSRs(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'asc' ? 'asc' : 'desc';
    const search = query.search || '';
    const status = query.status;
    const category = query.category;

    return await csrRepository.findAll({
      page,
      limit,
      sortBy,
      order,
      search,
      status,
      category,
    });
  }

  /**
   * Get CSR activity by ID
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async getCSRById(id) {
    const csr = await csrRepository.findById(id);
    if (!csr) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'CSR activity not found');
    }
    return csr;
  }

  /**
   * Update CSR activity details
   * @param {string} id 
   * @param {object} updateBody 
   * @returns {Promise<object>}
   */
  async updateCSR(id, updateBody) {
    const csr = await this.getCSRById(id);

    if (updateBody.title && updateBody.title.toLowerCase() !== csr.title.toLowerCase()) {
      const existing = await csrRepository.findByTitle(updateBody.title);
      if (existing) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'CSR activity with this title already exists');
      }
    }

    const updated = await csrRepository.update(id, updateBody);

    // If status changed, trigger notification
    if (updateBody.status && updateBody.status !== csr.status) {
      const status = updateBody.status;
      const isApproved = status === 'APPROVED' || status === 'Approved' || status === 'ACTIVE' || status === 'Active';
      const isRejected = status === 'REJECTED' || status === 'Rejected' || status === 'INACTIVE' || status === 'Inactive';
      
      if ((isApproved || isRejected) && csr.createdBy) {
        try {
          const { NotificationService } = await import('../notification/notification.service.js');
          const notificationService = new NotificationService();
          await notificationService.createNotification({
            userId: csr.createdBy,
            title: isApproved ? 'CSR Activity Approved' : 'CSR Activity Rejected',
            message: isApproved 
              ? `${csr.title} Approved by ESG Manager`
              : `CSR Activity Rejected. Reason: ${updateBody.rejectionReason || 'Budget exceeded.'}`,
            module: 'Social',
            referenceId: csr._id,
            priority: 'Normal',
            type: 'INFO'
          });
        } catch (err) {
          console.error('Failed to trigger CSR status notification:', err.message);
        }
      }
    }

    return updated;
  }

  /**
   * Soft delete CSR activity by ID
   * @param {string} id 
   * @returns {Promise<object>}
   */
  async deleteCSR(id) {
    await this.getCSRById(id);
    return await csrRepository.softDelete(id);
  }
}

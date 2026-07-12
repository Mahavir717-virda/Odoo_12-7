import { PolicyRepository } from './policy.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const policyRepository = new PolicyRepository();

export class PolicyService {
  async createPolicy(policyData) {
    const existing = await policyRepository.findByNumber(policyData.policyNumber);
    if (existing) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Policy with this policy number already exists');
    }
    return await policyRepository.create(policyData);
  }

  async getPolicyById(id) {
    const policy = await policyRepository.findById(id);
    if (!policy) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Policy not found');
    }
    return policy;
  }

  async listPolicies(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'asc' ? 'asc' : 'desc';
    const status = query.status;
    const category = query.category;
    const department = query.department;

    return await policyRepository.findAll({
      page,
      limit,
      sortBy,
      order,
      status,
      category,
      department,
    });
  }

  async updatePolicy(id, updateBody) {
    const policy = await this.getPolicyById(id);

    if (updateBody.policyNumber && updateBody.policyNumber.trim().toLowerCase() !== policy.policyNumber.toLowerCase()) {
      const existing = await policyRepository.findByNumber(updateBody.policyNumber);
      if (existing) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Policy with this policy number already exists');
      }
    }

    return await policyRepository.update(id, updateBody);
  }

  async acknowledgePolicy(employeeId, policyId) {
    const policy = await this.getPolicyById(policyId);
    if (policy.status !== 'Published') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot acknowledge an unpublished policy');
    }

    const alreadyAcknowledged = await policyRepository.getAcknowledgement(employeeId, policyId);
    if (alreadyAcknowledged) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You have already acknowledged this policy');
    }

    return await policyRepository.saveAcknowledgement(employeeId, policyId);
  }

  async getReports() {
    return await policyRepository.getReportsSummary();
  }
}

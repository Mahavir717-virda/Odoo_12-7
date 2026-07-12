import { Participation } from './participation.model.js';

export class ParticipationRepository {
  /**
   * Create a new participation entry
   * @param {object} participationData 
   * @returns {Promise<object>}
   */
  async create(participationData) {
    return await Participation.create(participationData);
  }

  /**
   * Find participation by ID with populates
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return await Participation.findOne({ _id: id, isDeleted: false })
      .populate('employee', 'name email')
      .populate('activity', 'title category points evidenceRequired')
      .populate('approvedBy', 'name email');
  }

  /**
   * Find participation by employee and activity
   * @param {string} employeeId 
   * @param {string} activityId 
   * @returns {Promise<object|null>}
   */
  async findByEmployeeAndActivity(employeeId, activityId) {
    return await Participation.findOne({ employee: employeeId, activity: activityId, isDeleted: false });
  }

  /**
   * Get approved participants count for a CSR activity
   * @param {string} activityId 
   * @returns {Promise<number>}
   */
  async getJoinedCountForActivity(activityId) {
    return await Participation.countDocuments({
      activity: activityId,
      status: 'APPROVED',
      isDeleted: false,
    });
  }

  /**
   * List all participations with filters, search, and pagination
   * @param {object} filters 
   * @returns {Promise<object>}
   */
  async findAll({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', employee, activity, status }) {
    const query = { isDeleted: false };

    if (employee) {
      query.employee = employee;
    }
    if (activity) {
      query.activity = activity;
    }
    if (status) {
      query.status = status;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const [results, totalCount] = await Promise.all([
      Participation.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('employee', 'name email')
        .populate('activity', 'title category points evidenceRequired')
        .populate('approvedBy', 'name email'),
      Participation.countDocuments(query),
    ]);

    return {
      results,
      totalCount,
      limit,
      page,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * Update a participation record
   * @param {string} id 
   * @param {object} updateData 
   * @returns {Promise<object|null>}
   */
  async update(id, updateData) {
    return await Participation.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('employee', 'name email')
      .populate('activity', 'title category points evidenceRequired')
      .populate('approvedBy', 'name email');
  }
}

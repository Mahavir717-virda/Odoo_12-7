import { Badge } from './badge.model.js';
import { EmployeeBadge } from './employeeBadge.model.js';

export class BadgeRepository {
  async create(badgeData) {
    return await Badge.create(badgeData);
  }

  async findByName(name) {
    return await Badge.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
  }

  async findById(id) {
    return await Badge.findById(id);
  }

  async findAllActive() {
    return await Badge.find({ isActive: true });
  }

  async grantBadge(employeeId, badgeId, earnedReason) {
    try {
      return await EmployeeBadge.create({ employeeId, badgeId, earnedReason });
    } catch (err) {
      // Ignore duplicates (unique index will reject duplicate entries)
      return null;
    }
  }

  async findByEmployeeId(employeeId) {
    return await EmployeeBadge.find({ employeeId })
      .populate('badgeId', 'name description category icon badgeColor xpRequired challengeRequired');
  }

  async findAllGranted() {
    return await EmployeeBadge.find({})
      .populate('employeeId', 'name email')
      .populate('badgeId', 'name icon');
  }
}

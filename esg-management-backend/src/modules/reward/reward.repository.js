import { Reward } from './reward.model.js';
import { RewardRedemption } from './rewardRedemption.model.js';
import mongoose from 'mongoose';

export class RewardRepository {
  async create(rewardData) {
    return await Reward.create(rewardData);
  }

  async findByName(name) {
    return await Reward.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
  }

  async findById(id) {
    return await Reward.findById(id);
  }

  async findAllActive() {
    const now = new Date();
    return await Reward.find({
      isActive: true,
      stock: { $gt: 0 },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: now } }
      ]
    });
  }

  async update(id, updateData) {
    return await Reward.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  }

  async createRedemption(redemptionData) {
    return await RewardRedemption.create(redemptionData);
  }

  async findRedemptionById(id) {
    return await RewardRedemption.findById(id)
      .populate('rewardId', 'name requiredPoints')
      .populate('employeeId', 'name email');
  }

  async updateRedemptionStatus(id, status) {
    return await RewardRedemption.findByIdAndUpdate(id, { $set: { status } }, { new: true });
  }

  async findRedemptionsByEmployee(employeeId) {
    return await RewardRedemption.find({ employeeId })
      .populate('rewardId', 'name description requiredPoints image')
      .sort({ redeemedAt: -1 });
  }

  async findAllRedemptions() {
    return await RewardRedemption.find({})
      .populate('rewardId', 'name requiredPoints stock')
      .populate('employeeId', 'name email')
      .sort({ redeemedAt: -1 });
  }

  async updateUserPoints(employeeId, pointsChange) {
    const User = mongoose.model('User');
    return await User.findByIdAndUpdate(employeeId, { $inc: { points: pointsChange } }, { new: true });
  }
}

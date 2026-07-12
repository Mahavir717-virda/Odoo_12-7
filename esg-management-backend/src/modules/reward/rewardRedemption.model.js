import mongoose from 'mongoose';
import { ALLOWED_REDEMPTION_STATUSES, REDEMPTION_STATUS } from './reward.constants.js';

const rewardRedemptionSchema = new mongoose.Schema(
  {
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      required: [true, 'Reward reference is required'],
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    pointsUsed: {
      type: Number,
      required: [true, 'Points used is required'],
      min: [0, 'Points used cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_REDEMPTION_STATUSES,
        message: 'Invalid redemption status',
      },
      default: REDEMPTION_STATUS.PENDING,
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

rewardRedemptionSchema.index({ status: 1 });

export const RewardRedemption = mongoose.models.RewardRedemption || mongoose.model('RewardRedemption', rewardRedemptionSchema);

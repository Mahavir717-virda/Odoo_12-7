import mongoose from 'mongoose';
import { ALLOWED_REDEMPTION_STATUSES, REDEMPTION_STATUS } from '../challenge.constants.js';

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
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_REDEMPTION_STATUSES,
        message: 'Invalid redemption status',
      },
      default: REDEMPTION_STATUS.PENDING,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

rewardRedemptionSchema.index({ status: 1 });

export const RewardRedemption = mongoose.model('RewardRedemption', rewardRedemptionSchema);

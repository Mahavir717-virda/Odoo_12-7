import mongoose from 'mongoose';
import { ALLOWED_REWARD_TYPES, REWARD_TYPE } from './reward.constants.js';

const rewardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Reward name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    rewardType: {
      type: String,
      enum: {
        values: ALLOWED_REWARD_TYPES,
        message: 'Invalid reward type',
      },
      default: REWARD_TYPE.VOUCHER,
    },
    requiredPoints: {
      type: Number,
      required: [true, 'Required points is required'],
      min: [0, 'Required points cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
    },
    image: {
      type: String,
      default: 'reward.png',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

rewardSchema.index({ isActive: 1 });

export const Reward = mongoose.models.Reward || mongoose.model('Reward', rewardSchema);

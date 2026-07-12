import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Reward title is required'],
      unique: true,
      trim: true,
    },
    requiredPoints: {
      type: Number,
      required: [true, 'Points requirement is required'],
      min: [0, 'Required points cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Reward stock is required'],
      min: [0, 'Stock cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
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

export const Reward = mongoose.model('Reward', rewardSchema);

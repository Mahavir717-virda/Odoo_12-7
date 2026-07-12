import mongoose from 'mongoose';

const challengeProgressSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: [true, 'Challenge reference is required'],
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    completedTasks: {
      type: Number,
      default: 0,
      min: [0, 'Completed tasks cannot be negative'],
    },
    totalTasks: {
      type: Number,
      default: 1,
      min: [1, 'Total tasks must be at least 1'],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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

challengeProgressSchema.index({ challengeId: 1, employeeId: 1 }, { unique: true });

export const ChallengeProgress = mongoose.model('ChallengeProgress', challengeProgressSchema);

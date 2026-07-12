import mongoose from 'mongoose';
import {
  ALLOWED_GOAL_TYPES,
  ALLOWED_GOAL_PRIORITIES,
  ALLOWED_GOAL_STATUSES,
  ALLOWED_ACHIEVEMENT_STATUSES,
  GOAL_STATUS,
  GOAL_PRIORITY,
  ACHIEVEMENT_STATUS,
} from './goal.constants.js';

// Try to register a stub User schema if not already defined to prevent runtime population issues
if (!mongoose.models.User) {
  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    { timestamps: true }
  );
  mongoose.model('User', userSchema);
}

const goalSchema = new mongoose.Schema(
  {
    goalCode: {
      type: String,
      required: [true, 'Goal code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    goalType: {
      type: String,
      required: [true, 'Goal type is required'],
      enum: {
        values: ALLOWED_GOAL_TYPES,
        message: 'Invalid goal type',
      },
    },
    baselineValue: {
      type: Number,
      required: [true, 'Baseline value is required'],
      min: [0, 'Baseline value must be greater than or equal to 0'],
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
      min: [0.000001, 'Target value must be greater than 0'],
    },
    currentValue: {
      type: Number,
      default: 0,
      min: [0, 'Current value cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
    },
    priority: {
      type: String,
      enum: {
        values: ALLOWED_GOAL_PRIORITIES,
        message: 'Invalid priority value',
      },
      default: GOAL_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_GOAL_STATUSES,
        message: 'Invalid status value',
      },
      default: GOAL_STATUS.DRAFT,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Progress percentage cannot be negative'],
      max: [100, 'Progress percentage cannot exceed 100'],
    },
    achievementStatus: {
      type: String,
      enum: {
        values: ALLOWED_ACHIEVEMENT_STATUSES,
        message: 'Invalid achievement status',
      },
      default: ACHIEVEMENT_STATUS.ON_TRACK,
    },
    autoTrack: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

// Setup indexes
goalSchema.index({ goalCode: 1 });
goalSchema.index({ department: 1 });
goalSchema.index({ goalType: 1 });
goalSchema.index({ status: 1 });
goalSchema.index({ targetDate: 1 });
goalSchema.index({ isDeleted: 1 });

// Compound index
goalSchema.index({ department: 1, status: 1 });

export const Goal = mongoose.model('Goal', goalSchema);
export default Goal;

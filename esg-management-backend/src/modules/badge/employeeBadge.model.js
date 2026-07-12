import mongoose from 'mongoose';

const employeeBadgeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: [true, 'Badge reference is required'],
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    earnedReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicating badges earned by the same employee
employeeBadgeSchema.index({ employeeId: 1, badgeId: 1 }, { unique: true });

export const EmployeeBadge = mongoose.models.EmployeeBadge || mongoose.model('EmployeeBadge', employeeBadgeSchema);

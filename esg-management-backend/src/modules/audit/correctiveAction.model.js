import mongoose from 'mongoose';
import { ALLOWED_PRIORITIES, ALLOWED_CORRECTIVE_ACTION_STATUSES, CORRECTIVE_ACTION_STATUS, AUDIT_PRIORITY } from './audit.constants.js';

const correctiveActionSchema = new mongoose.Schema(
  {
    findingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuditFinding',
      required: [true, 'Finding reference is required'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee assignment reference is required'],
    },
    action: {
      type: String,
      required: [true, 'Action description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: ALLOWED_PRIORITIES,
        message: 'Priority must be Low, Medium, or High',
      },
      default: AUDIT_PRIORITY.MEDIUM,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_CORRECTIVE_ACTION_STATUSES,
        message: 'Status must be Pending, Resolved, or Verified',
      },
      default: CORRECTIVE_ACTION_STATUS.PENDING,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

correctiveActionSchema.index({ findingId: 1 });
correctiveActionSchema.index({ assignedTo: 1 });

export const CorrectiveAction = mongoose.models.CorrectiveAction || mongoose.model('CorrectiveAction', correctiveActionSchema);

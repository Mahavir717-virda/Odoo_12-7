import mongoose from 'mongoose';
import { ALLOWED_AUDIT_STATUSES, AUDIT_STATUS } from './audit.constants.js';

const auditSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Audit name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Audit type is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    auditor: {
      type: String,
      trim: true,
      default: 'Internal Auditor',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_AUDIT_STATUSES,
        message: 'Status must be Scheduled, In Progress, Completed, or Closed',
      },
      default: AUDIT_STATUS.SCHEDULED,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

auditSchema.index({ status: 1 });

export const Audit = mongoose.models.Audit || mongoose.model('Audit', auditSchema);

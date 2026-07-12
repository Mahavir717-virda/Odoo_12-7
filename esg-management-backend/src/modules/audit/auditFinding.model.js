import mongoose from 'mongoose';
import { ALLOWED_SEVERITIES, ALLOWED_FINDING_STATUSES, FINDING_STATUS, AUDIT_SEVERITY } from './audit.constants.js';

const auditFindingSchema = new mongoose.Schema(
  {
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      required: [true, 'Audit reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Finding title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    severity: {
      type: String,
      enum: {
        values: ALLOWED_SEVERITIES,
        message: 'Severity must be Low, Medium, or High',
      },
      default: AUDIT_SEVERITY.MEDIUM,
    },
    evidenceUrl: {
      type: String,
      default: null,
    },
    recommendation: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_FINDING_STATUSES,
        message: 'Status must be Open, In Progress, Resolved, or Closed',
      },
      default: FINDING_STATUS.OPEN,
    },
  },
  {
    timestamps: true,
  }
);

auditFindingSchema.index({ auditId: 1 });
auditFindingSchema.index({ status: 1 });

export const AuditFinding = mongoose.models.AuditFinding || mongoose.model('AuditFinding', auditFindingSchema);

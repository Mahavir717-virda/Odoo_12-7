import mongoose from 'mongoose';
import { ALLOWED_COMPLIANCE_STATUSES, ALLOWED_COMPLIANCE_SOURCES, ALLOWED_SEVERITIES, ALLOWED_PRIORITIES, COMPLIANCE_STATUS, COMPLIANCE_SEVERITY, COMPLIANCE_SOURCE } from './compliance.constants.js';

const complianceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Compliance title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    source: {
      type: String,
      enum: {
        values: ALLOWED_COMPLIANCE_SOURCES,
        message: 'Source must be Audit, Policy, or Manual',
      },
      default: COMPLIANCE_SOURCE.MANUAL,
    },
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      default: null,
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy',
      default: null,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    severity: {
      type: String,
      enum: {
        values: ALLOWED_SEVERITIES,
        message: 'Severity must be Low, Medium, or High',
      },
      default: COMPLIANCE_SEVERITY.MEDIUM,
    },
    priority: {
      type: String,
      enum: {
        values: ALLOWED_PRIORITIES,
        message: 'Priority must be Low, Medium, or High',
      },
      default: COMPLIANCE_SEVERITY.MEDIUM,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter reference is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_COMPLIANCE_STATUSES,
        message: 'Status must be Open, In Progress, Resolved, or Closed',
      },
      default: COMPLIANCE_STATUS.OPEN,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

complianceSchema.index({ status: 1 });
complianceSchema.index({ assignedTo: 1 });

export const Compliance = mongoose.models.Compliance || mongoose.model('Compliance', complianceSchema);

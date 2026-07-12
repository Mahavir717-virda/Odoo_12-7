import mongoose from 'mongoose';
import { ALLOWED_POLICY_CATEGORIES, ALLOWED_POLICY_STATUSES, POLICY_STATUS, POLICY_CATEGORIES } from './policy.constants.js';

const policySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Policy title is required'],
      trim: true,
    },
    policyNumber: {
      type: String,
      required: [true, 'Policy number is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ALLOWED_POLICY_CATEGORIES,
        message: 'Invalid policy category',
      },
      default: POLICY_CATEGORIES.ENVIRONMENTAL,
    },
    description: {
      type: String,
      trim: true,
    },
    documentUrl: {
      type: String,
      default: 'policy.pdf',
    },
    version: {
      type: String,
      default: '1.0',
    },
    effectiveDate: {
      type: Date,
      required: [true, 'Effective date is required'],
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    department: {
      type: String,
      default: 'All',
    },
    mandatory: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_POLICY_STATUSES,
        message: 'Status must be Draft, Published, or Archived',
      },
      default: POLICY_STATUS.DRAFT,
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

policySchema.index({ status: 1 });
policySchema.index({ policyNumber: 1 });

export const Policy = mongoose.models.Policy || mongoose.model('Policy', policySchema);

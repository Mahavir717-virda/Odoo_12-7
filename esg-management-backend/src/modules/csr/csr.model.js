import mongoose from 'mongoose';
import { CSR_STATUS, ALLOWED_STATUSES, CSR_CATEGORY, ALLOWED_CATEGORIES } from './csr.constants.js';

const csrSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'CSR activity title is required'],
      unique: true,
      trim: true,
      minlength: [3, 'CSR activity title must be at least 3 characters'],
      maxlength: [100, 'CSR activity title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'CSR activity description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ALLOWED_CATEGORIES,
        message: 'Invalid category for CSR activity',
      },
      default: CSR_CATEGORY.ENVIRONMENT,
    },
    points: {
      type: Number,
      required: [true, 'Points allocation is required'],
      min: [0, 'Points cannot be negative'],
    },
    evidenceRequired: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_STATUSES,
        message: 'Status must be either ACTIVE or INACTIVE',
      },
      default: CSR_STATUS.ACTIVE,
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

// Create index on status and isDeleted
csrSchema.index({ status: 1 });
csrSchema.index({ isDeleted: 1 });

export const CSR = mongoose.model('CSR', csrSchema);

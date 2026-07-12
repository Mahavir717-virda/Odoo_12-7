import mongoose from 'mongoose';
import { ALLOWED_CATEGORY_TYPES, ALLOWED_CATEGORY_STATUSES, CATEGORY_STATUS } from './category.constants.js';

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

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [3, 'Category name must be at least 3 characters'],
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Category description cannot exceed 500 characters'],
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: {
        values: ALLOWED_CATEGORY_TYPES,
        message: 'Invalid category type',
      },
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_CATEGORY_STATUSES,
        message: 'Invalid status',
      },
      default: CATEGORY_STATUS.ACTIVE,
    },
    color: {
      type: String,
      required: [true, 'Color code is required'],
      trim: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code'],
    },
    icon: {
      type: String,
      trim: true,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    scoreWeight: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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

// Create compound and individual indexes
categorySchema.index({ type: 1, name: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ isDeleted: 1 });

export const Category = mongoose.model('Category', categorySchema);

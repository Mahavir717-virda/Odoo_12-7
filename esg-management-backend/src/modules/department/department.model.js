import mongoose from 'mongoose';
import { DEPARTMENT_STATUS, ALLOWED_STATUSES } from './department.constants.js';

// Try to load or register a stub User schema to prevent populate crashes when User model is referenced
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

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Department name must be at least 3 characters'],
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [2, 'Department code must be at least 2 characters'],
      maxlength: [10, 'Department code cannot exceed 10 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    parentDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    employeeCount: {
      type: Number,
      default: 0,
      min: [0, 'Employee count cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_STATUSES,
        message: 'Status must be either ACTIVE or INACTIVE',
      },
      default: DEPARTMENT_STATUS.ACTIVE,
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
departmentSchema.index({ status: 1 });
departmentSchema.index({ isDeleted: 1 });

export const Department = mongoose.model('Department', departmentSchema);

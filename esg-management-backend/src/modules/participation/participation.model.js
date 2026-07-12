import mongoose from 'mongoose';
import { PARTICIPATION_STATUS, ALLOWED_STATUSES } from './participation.constants.js';

// Register User stub if not already registered to prevent crashes on populate
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

const participationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CSR',
      required: [true, 'CSR Activity reference is required'],
    },
    proof: {
      type: String, // Path or filename of the uploaded evidence
      default: null,
    },
    points: {
      type: Number,
      default: 0,
      min: [0, 'Points cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_STATUSES,
        message: 'Status must be PENDING, APPROVED, or REJECTED',
      },
      default: PARTICIPATION_STATUS.PENDING,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
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

// Indexes for performance
participationSchema.index({ employee: 1 });
participationSchema.index({ activity: 1 });
participationSchema.index({ status: 1 });
participationSchema.index({ isDeleted: 1 });

export const Participation = mongoose.model('Participation', participationSchema);

import mongoose from 'mongoose';
import { ALLOWED_VERIFICATION_STATUSES } from '../challenge.constants.js';

const challengeVerificationSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: [true, 'Challenge reference is required'],
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChallengeEvidence',
      required: [true, 'Evidence reference is required'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_VERIFICATION_STATUSES,
        message: 'Invalid verification status',
      },
      required: [true, 'Verification status is required'],
    },
    remarks: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
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

challengeVerificationSchema.index({ challengeId: 1 });
challengeVerificationSchema.index({ employeeId: 1 });

export const ChallengeVerification = mongoose.model('ChallengeVerification', challengeVerificationSchema);

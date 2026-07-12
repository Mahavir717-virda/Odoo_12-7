import mongoose from 'mongoose';
import { ALLOWED_EVIDENCE_STATUSES, EVIDENCE_STATUS } from '../challenge.constants.js';

const challengeEvidenceSchema = new mongoose.Schema(
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
    fileUrl: {
      type: String,
      required: [true, 'File URL or filename is required'],
    },
    fileType: {
      type: String,
      enum: {
        values: ['image', 'pdf', 'video', 'document'],
        message: 'Invalid file type',
      },
      required: [true, 'File type is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_EVIDENCE_STATUSES,
        message: 'Invalid status for evidence',
      },
      default: EVIDENCE_STATUS.PENDING,
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

challengeEvidenceSchema.index({ challengeId: 1 });
challengeEvidenceSchema.index({ employeeId: 1 });
challengeEvidenceSchema.index({ status: 1 });

export const ChallengeEvidence = mongoose.model('ChallengeEvidence', challengeEvidenceSchema);

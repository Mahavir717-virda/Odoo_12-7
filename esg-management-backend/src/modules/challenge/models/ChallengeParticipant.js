import mongoose from 'mongoose';
import { ALLOWED_PARTICIPANT_STATUSES, PARTICIPANT_STATUS } from '../challenge.constants.js';

const challengeParticipantSchema = new mongoose.Schema(
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
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_PARTICIPANT_STATUSES,
        message: 'Invalid status for participant',
      },
      default: PARTICIPANT_STATUS.JOINED,
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

// Prevent duplicate joins
challengeParticipantSchema.index({ challengeId: 1, employeeId: 1 }, { unique: true });
challengeParticipantSchema.index({ status: 1 });

export const ChallengeParticipant = mongoose.model('ChallengeParticipant', challengeParticipantSchema);

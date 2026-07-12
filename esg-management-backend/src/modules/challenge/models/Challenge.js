import mongoose from 'mongoose';
import { ALLOWED_CHALLENGE_STATUSES, ALLOWED_DIFFICULTIES, CHALLENGE_STATUS, CHALLENGE_DIFFICULTY } from '../challenge.constants.js';

// Register User stub if not registered
if (!mongoose.models.User) {
  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      xp: { type: Number, default: 0 },
      points: { type: Number, default: 0 },
    },
    { timestamps: true }
  );
  mongoose.model('User', userSchema);
}

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Challenge title must be at least 3 characters'],
      maxlength: [100, 'Challenge title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Challenge description is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChallengeCategory',
      required: [true, 'Challenge category is required'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ALLOWED_DIFFICULTIES,
        message: 'Difficulty must be EASY, MEDIUM, or HARD',
      },
      default: CHALLENGE_DIFFICULTY.MEDIUM,
    },
    department: {
      type: String,
      default: 'All',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    xpReward: {
      type: Number,
      required: [true, 'XP reward is required'],
      min: [0, 'XP reward cannot be negative'],
    },
    pointsReward: {
      type: Number,
      required: [true, 'Points reward is required'],
      min: [0, 'Points reward cannot be negative'],
    },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      default: null,
    },
    evidenceRequired: {
      type: Boolean,
      default: true,
    },
    maxParticipants: {
      type: Number,
      default: 500,
      min: [1, 'Maximum participants must be at least 1'],
    },
    banner: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_CHALLENGE_STATUSES,
        message: 'Status must be ACTIVE or INACTIVE',
      },
      default: CHALLENGE_STATUS.ACTIVE,
    },
    createdBy: {
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

challengeSchema.index({ status: 1 });
challengeSchema.index({ isDeleted: 1 });

export const Challenge = mongoose.model('Challenge', challengeSchema);
